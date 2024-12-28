/**
 * tab-dnd.test.js
 */
/* eslint-disable import-x/order */

/* api */
import sinon from 'sinon';
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom, mockPort } from './mocha/setup.js';

/* test */
import * as mjs from '../src/mjs/tab-dnd.js';
import {
  CLASS_HEADING, CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_COLLAPSED, CLASS_TAB_GROUP,
  DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE, HIGHLIGHTED,
  MIME_JSON, MIME_MOZ_URL, MIME_PLAIN, MIME_URI,
  PINNED, SIDEBAR, SIDEBAR_MAIN, TAB
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

  describe('clear drop target', () => {
    const func = mjs.clearDropTarget;

    it('should remove class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      func();
      assert.isTrue(elm.classList.contains(TAB), 'class');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should remove class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      func();
      assert.isTrue(elm.classList.contains(TAB), 'class');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'class');
    });

    it('should remove class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      func();
      assert.isTrue(elm.classList.contains(TAB), 'class');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'class');
    });

    it('should remove class', () => {
      const parent = document.createElement('div');
      const heading = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP,
        CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      heading.classList.add(CLASS_HEADING);
      heading.appendChild(span);
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(parent);
      const i = browser.i18n.getMessage.callCount;
      func();
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 2, 'called');
      assert.isTrue(elm.classList.contains(TAB), 'class');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'class');
    });

    it('should remove class', () => {
      const parent = document.createElement('div');
      const heading = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      span.appendChild(img);
      heading.classList.add(CLASS_HEADING);
      heading.appendChild(span);
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(parent);
      const i = browser.i18n.getMessage.callCount;
      func();
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.strictEqual(browser.i18n.getMessage.callCount, i, 'not called');
      assert.isTrue(elm.classList.contains(TAB), 'class');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'class');
    });
  });

  describe('create dropped text tabs in order', () => {
    const func = mjs.createDroppedTextTabsInOrder;

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.search.query.callCount;
      const res = await func();
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.search.query.callCount, j, 'not called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const order = [];
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        order.push({
          id,
          url: opt?.url
        });
        return tab;
      });
      const res = await func([
        [{
          type: 'url',
          value: 'https://example.com'
        }, {}],
        [{
          type: 'search',
          value: 'foo'
        }, {}],
        [{
          type: 'url',
          value: 'https://www.example.net'
        }, {}],
        [{
          type: 'search',
          value: 'bar'
        }, {}]
      ]);
      assert.strictEqual(createFunc.callCount, 4, 'called');
      assert.strictEqual(browser.search.query.callCount, 2, 'called');
      assert.isUndefined(res, 'result');
      assert.deepEqual(order, [
        {
          id: 11,
          url: 'https://example.com'
        },
        {
          id: 12,
          url: undefined
        },
        {
          id: 13,
          url: 'https://www.example.net'
        },
        {
          id: 14,
          url: undefined
        }
      ], 'order');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const order = [];
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        order.push({
          id,
          url: opt?.url
        });
        return tab;
      });
      const res = await func([
        [{
          type: 'url',
          value: 'https://example.com'
        }, {}],
        [{
          type: 'search',
          value: 'foo'
        }, {}],
        [{
          type: 'url',
          value: 'https://www.example.net'
        }, {}],
        [{
          type: 'search',
          value: 'bar'
        }, {}]
      ], true);
      assert.strictEqual(createFunc.callCount, 4, 'called');
      assert.strictEqual(browser.search.query.callCount, 2, 'called');
      assert.isUndefined(res, 'result');
      assert.deepEqual(order, [
        {
          id: 11,
          url: undefined
        },
        {
          id: 12,
          url: 'https://www.example.net'
        },
        {
          id: 13,
          url: undefined
        },
        {
          id: 14,
          url: 'https://example.com'
        }
      ], 'order');
      assert.isUndefined(res, 'result');
    });
  });

  describe('handle dropped text', () => {
    const func = mjs.handleDroppedText;

    it('shoult not call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        mime: 'application/x-foo',
        textValue: 'https://example.com\njavascript:void(0)\nfoo\n\nbar'
      };
      const res = await func(elm2, data);
      assert.isFalse(browser.tabs.create.called, 'not called');
      assert.isFalse(browser.search.search.called, 'not called');
      assert.isFalse(browser.search.query.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        mime: MIME_URI,
        textValue: 'https://example.com\r\n#foo\r\nhttps://www.example.net\r\n'
      };
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      const res = await func(elm2, data);
      assert.strictEqual(createFunc.callCount, 2, 'called');
      assert.isFalse(browser.search.search.called, 'not called');
      assert.isFalse(browser.search.query.called, 'not called');
      assert.isUndefined(res, 'result');
    });

    it('shoult call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        mime: MIME_URI,
        textValue: 'https://example.com\r\n#foo\r\njavascript:void(0)'
      };
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      const res = await func(elm2, data);
      assert.strictEqual(createFunc.callCount, 1, 'called');
      assert.isFalse(browser.search.search.called, 'not called');
      assert.isFalse(browser.search.query.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('shoult call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        mime: MIME_PLAIN,
        textValue: 'https://example.com\njavascript:void(0)\nfoo\n\nbar'
      };
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      const res = await func(elm2, data);
      assert.strictEqual(createFunc.callCount, 4, 'called');
      assert.strictEqual(browser.search.search.callCount, 0, 'not called');
      assert.strictEqual(browser.search.query.callCount, 3, 'called');
      assert.isUndefined(res, 'result');
    });

    it('shoult call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        mime: MIME_PLAIN,
        textValue: 'foo\nhttps://example.com\nbar'
      };
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      const getTab = browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      const res = await func(elm2, data);
      assert.strictEqual(createFunc.callCount, 3, 'called');
      assert.strictEqual(browser.search.search.callCount, 0, 'not called');
      assert.strictEqual(browser.search.query.callCount, 2, 'called');
      assert.isTrue(getTab.called, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        mime: MIME_URI,
        textValue: 'https://example.com\r\n#foo\r\nhttps://www.example.net\r\n'
      };
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      const getFunc = browser.tabs.get.withArgs(11).resolves({
        id: 11
      });
      const res = await func(elm3, data);
      assert.strictEqual(createFunc.callCount, 2, 'called');
      assert.isFalse(browser.search.search.called, 'not called');
      assert.isFalse(browser.search.query.called, 'not called');
      assert.isFalse(getFunc.called, 'not called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'move',
        dropWindowId: 1,
        mime: MIME_URI,
        textValue: 'https://example.com\r\n#foo\r\nhttps://www.example.net\r\n'
      };
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      const getFunc = browser.tabs.get.withArgs(11).resolves({
        id: 11
      });
      const res = await func(elm3, data);
      assert.strictEqual(createFunc.callCount, 2, 'called');
      assert.isFalse(browser.search.search.called, 'not called');
      assert.isFalse(browser.search.query.called, 'not called');
      assert.isFalse(getFunc.called, 'not called');
      assert.isUndefined(res, 'result');
    });

    it('shoult call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        mime: MIME_PLAIN,
        textValue: 'foo\nhttps://example.com\njavascript:void(0)\nbar'
      };
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      const getFunc = browser.tabs.get.withArgs(11).resolves({
        id: 11,
        index: 3
      });
      const res = await func(elm3, data);
      assert.strictEqual(createFunc.callCount, 4, 'called');
      assert.strictEqual(browser.search.search.callCount, 0, 'not called');
      assert.strictEqual(browser.search.query.callCount, 3, 'called');
      assert.isTrue(getFunc.called, 'called');
      assert.isUndefined(res, 'result');
    });

    it('shoult call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'move',
        dropWindowId: 1,
        mime: MIME_PLAIN,
        textValue: 'foo\nhttps://example.com\njavascript:void(0)\nbar'
      };
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      const getFunc = browser.tabs.get.withArgs(11).resolves({
        id: 11,
        index: 2
      });
      const res = await func(elm3, data);
      assert.strictEqual(createFunc.callCount, 4, 'called');
      assert.strictEqual(browser.search.search.callCount, 0, 'not called');
      assert.strictEqual(browser.search.query.callCount, 3, 'called');
      assert.isTrue(getFunc.called, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: false,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        mime: MIME_URI,
        textValue: 'https://example.com\r\n#foo\r\nhttps://www.example.net\r\n'
      };
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId,
          index: 2
        };
      });
      const getFunc = browser.tabs.get.withArgs(3).resolves({
        id: 3,
        index: 2
      });
      const res = await func(elm3, data);
      assert.strictEqual(updateFunc.callCount, 1, 'called');
      assert.strictEqual(createFunc.callCount, 1, 'called');
      assert.isFalse(browser.search.search.called, 'not called');
      assert.isFalse(browser.search.query.called, 'not called');
      assert.isFalse(getFunc.called, 'not called');
      assert.isUndefined(res, 'result');
    });

    it('shoult call function', async () => {
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        dropAfter: false,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        mime: MIME_PLAIN,
        textValue: 'foo\nhttps://example.com\njavascript:void(0)\nbar'
      };
      let id = 10;
      const createFunc = browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId,
          index: 2
        };
      });
      const getFunc = browser.tabs.get.withArgs(3).resolves({
        id: 3,
        index: 2
      });
      const res = await func(elm3, data);
      assert.strictEqual(updateFunc.callCount, 1, 'called');
      assert.strictEqual(createFunc.callCount, 3, 'called');
      assert.strictEqual(browser.search.search.callCount, 1, 'called');
      assert.strictEqual(browser.search.query.callCount, 2, 'called');
      assert.isFalse(getFunc.called, 'not called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('handle dropped tabs', () => {
    const func = mjs.handleDroppedTabs;

    it('should not call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 9,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [1],
        tabGroup: false,
        tabIds: []
      };
      const res = await func(elm2, data);
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(browser.tabs.update.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 1,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [1],
        tabGroup: false,
        tabIds: []
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const res = await func(elm2, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(browser.tabs.update.called, 'not called');
      assert.deepEqual(res, [{
        id: 1,
        index: 1
      }], 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 2,
        dragWindowId: 1,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [2],
        tabGroup: false,
        tabIds: []
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const res = await func(elm, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(browser.tabs.update.called, 'not called');
      assert.deepEqual(res, [{
        id: 2,
        index: 0
      }], 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 1,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [1],
        tabGroup: false,
        tabIds: []
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm2, data);
      const node = document.querySelector('[data-tab-id="11"]');
      const nodeParent = node.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isTrue(updateFunc.called, 'called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isTrue(nodeParent === parent2.previousElementSibling, 'parent');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: false,
        tabIds: [4]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm2, data);
      const node = document.querySelector('[data-tab-id="14"]');
      const nodeParent = node.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(updateFunc.called, 'not called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isTrue(nodeParent === parent2.previousElementSibling, 'parent');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [1],
        tabGroup: false,
        tabIds: [4]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm2, data);
      const node = document.querySelector('[data-tab-id="11"]');
      const nodeParent = node.parentNode;
      const node2 = document.querySelector('[data-tab-id="14"]');
      const node2Parent = node2.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isTrue(updateFunc.called, 'not called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isFalse(nodeParent === node2Parent, 'parent');
      assert.isFalse(node2Parent === parent, 'parent');
      assert.isFalse(node2Parent === parent2, 'parent');
      assert.isTrue(node2Parent === nodeParent.nextElementSibling, 'parent');
      assert.isTrue(node2Parent === parent2.previousElementSibling, 'parent');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: true,
        dragTabId: 4,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: false,
        tabIds: [4]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm2, data);
      const node = document.querySelector('[data-tab-id="14"]');
      const nodeParent = node.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(updateFunc.called, 'not called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isTrue(nodeParent === parent2.previousElementSibling, 'parent');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: true,
        dragTabId: 4,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [1],
        tabGroup: false,
        tabIds: [4]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm2, data);
      const node = document.querySelector('[data-tab-id="14"]');
      const nodeParent = node.parentNode;
      const node2 = document.querySelector('[data-tab-id="11"]');
      const node2Parent = node2.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isTrue(updateFunc.called, 'not called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isTrue(nodeParent === parent2.previousElementSibling, 'parent');
      assert.isTrue(node2Parent === nodeParent, 'parent');
      assert.isTrue(node === nodeParent.lastElementChild, 'node');
      assert.isTrue(node === node2.nextElementSibling, 'node');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: true,
        tabIds: [3, 4]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm2, data);
      const node = document.querySelector('[data-tab-id="14"]');
      const nodeParent = node.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(updateFunc.called, 'not called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isTrue(nodeParent === parent2.previousElementSibling, 'parent');
      assert.isTrue(nodeParent.classList.contains(CLASS_TAB_GROUP), 'parent');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: false,
        tabIds: [3]
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const res = await func(elm4, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(browser.tabs.update.called, 'not called');
      assert.deepEqual(res, [{
        id: 3,
        index: 3
      }], 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: 1,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: false,
        tabIds: [4]
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const res = await func(elm3, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(browser.tabs.update.called, 'not called');
      assert.deepEqual(res, [{
        id: 4,
        index: 2
      }], 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        url: 'https://example.com/qux',
        title: 'Qux'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      parent3.appendChild(elm5);
      main.appendChild(parent);
      main.appendChild(parent2);
      main.appendChild(parent3);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: true,
        dragTabId: 3,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: false,
        tabIds: [3]
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const res = await func(elm5, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(browser.tabs.update.called, 'not called');
      assert.isTrue(elm3.parentNode === parent3, 'parent');
      assert.isTrue(elm3 === elm5.nextElementSibling, 'node');
      assert.deepEqual(res, [{
        id: 3,
        index: 4
      }], 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        url: 'https://example.com/qux',
        title: 'Qux'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      parent3.appendChild(elm5);
      main.appendChild(parent);
      main.appendChild(parent2);
      main.appendChild(parent3);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: true,
        dragTabId: 5,
        dragWindowId: 1,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: false,
        tabIds: [5]
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const res = await func(elm3, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(browser.tabs.update.called, 'not called');
      assert.isTrue(elm5.parentNode === parent2, 'parent');
      assert.isTrue(elm5 === elm3.previousElementSibling, 'node');
      assert.deepEqual(res, [{
        id: 5,
        index: 2
      }], 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        url: 'https://example.com/qux',
        title: 'Qux'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      parent3.appendChild(elm5);
      main.appendChild(parent);
      main.appendChild(parent2);
      main.appendChild(parent3);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: true,
        tabIds: [3, 4]
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const res = await func(elm5, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(browser.tabs.update.called, 'not called');
      assert.isFalse(elm3.parentNode === parent3, 'parent');
      assert.isTrue(elm3.parentNode === parent3.nextElementSibling, 'parent');
      assert.isTrue(elm3 === elm3.parentNode.firstElementChild, 'node');
      assert.isTrue(elm4.parentNode === elm3.parentNode, 'parent');
      assert.isTrue(elm4 === elm3.nextElementSibling, 'node');
      assert.deepEqual(res, [{
        id: 3,
        index: 4
      }, {
        id: 4,
        index: 5
      }], 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        url: 'https://example.com/qux',
        title: 'Qux'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      parent3.appendChild(elm5);
      main.appendChild(parent);
      main.appendChild(parent2);
      main.appendChild(parent3);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 5,
        dragWindowId: 1,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: true,
        tabIds: [4, 5]
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const res = await func(elm3, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(browser.tabs.update.called, 'not called');
      assert.isFalse(elm4.parentNode === parent3, 'parent');
      assert.isTrue(elm4.parentNode === parent2.previousElementSibling,
        'parent');
      assert.isTrue(elm4 === elm4.parentNode.firstElementChild, 'node');
      assert.isTrue(elm5.parentNode === elm4.parentNode, 'parent');
      assert.isTrue(elm5 === elm4.nextElementSibling, 'node');
      assert.deepEqual(res, [{
        id: 4,
        index: 2
      }, {
        id: 5,
        index: 3
      }], 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: false,
        tabIds: [3]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm4, data);
      const node = document.querySelector('[data-tab-id="13"]');
      const nodeParent = node.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(updateFunc.called, 'called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isTrue(nodeParent === parent2.nextElementSibling, 'parent');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 1,
        dragWindowId: 1,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [1],
        tabGroup: false,
        tabIds: []
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm3, data);
      const node = document.querySelector('[data-tab-id="11"]');
      const nodeParent = node.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isTrue(updateFunc.called, 'called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isTrue(nodeParent === parent2.previousElementSibling, 'parent');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 1,
        dragWindowId: 1,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [1],
        tabGroup: false,
        tabIds: [4]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm3, data);
      const node = document.querySelector('[data-tab-id="11"]');
      const nodeParent = node.parentNode;
      const node2 = document.querySelector('[data-tab-id="14"]');
      const node2Parent = node2.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isTrue(updateFunc.called, 'called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isFalse(node2Parent === parent, 'parent');
      assert.isFalse(node2Parent === parent2, 'parent');
      assert.isTrue(node2Parent === nodeParent.nextElementSibling, 'parent');
      assert.isTrue(node2Parent === parent2.previousElementSibling, 'parent');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        url: 'https://example.com/qux',
        title: 'Qux'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      parent3.appendChild(elm5);
      main.appendChild(parent);
      main.appendChild(parent2);
      main.appendChild(parent3);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: true,
        dragTabId: 1,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [1],
        tabGroup: false,
        tabIds: []
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm5, data);
      const node = document.querySelector('[data-tab-id="11"]');
      const nodeParent = node.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isTrue(updateFunc.called, 'called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isTrue(nodeParent === parent3, 'parent');
      assert.isTrue(nodeParent.classList.contains(CLASS_TAB_GROUP), 'class');
      assert.isTrue(node === elm5.nextElementSibling, 'node');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        url: 'https://example.com/qux',
        title: 'Qux'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      parent3.appendChild(elm5);
      main.appendChild(parent);
      main.appendChild(parent2);
      main.appendChild(parent3);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: true,
        dragTabId: 5,
        dragWindowId: 1,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: false,
        tabIds: [5]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm3, data);
      const node = document.querySelector('[data-tab-id="15"]');
      const nodeParent = node.parentNode;
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(updateFunc.called, 'called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isTrue(nodeParent === parent2, 'parent');
      assert.isFalse(nodeParent === parent3, 'parent');
      assert.isTrue(nodeParent.classList.contains(CLASS_TAB_GROUP), 'class');
      assert.isTrue(node === elm3.previousElementSibling, 'node');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        url: 'https://example.com/qux',
        title: 'Qux'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      parent3.appendChild(elm5);
      main.appendChild(parent);
      main.appendChild(parent2);
      main.appendChild(parent3);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 1,
        dragWindowId: 1,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [1, 2],
        tabGroup: true,
        tabIds: []
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm5, data);
      const node = document.querySelector('[data-tab-id="11"]');
      const nodeParent = node.parentNode;
      const node2 = document.querySelector('[data-tab-id="12"]');
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isTrue(updateFunc.called, 'called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isFalse(nodeParent === parent3, 'parent');
      assert.isTrue(nodeParent === parent3.previousElementSibling, 'parent');
      assert.isTrue(nodeParent.classList.contains(CLASS_TAB_GROUP), 'class');
      assert.isTrue(node === nodeParent.firstElementChild, 'node');
      assert.isTrue(node === node2.previousElementSibling, 'node');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        url: 'https://example.com/qux',
        title: 'Qux'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      parent3.appendChild(elm5);
      main.appendChild(parent);
      main.appendChild(parent2);
      main.appendChild(parent3);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: 1,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [],
        tabGroup: true,
        tabIds: [3, 4]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        const item = document.createElement('p');
        item.classList.add(TAB);
        item.dataset.tabId = `${id}`;
        body.appendChild(item);
        return {
          id
        };
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm5, data);
      const node = document.querySelector('[data-tab-id="13"]');
      const nodeParent = node.parentNode;
      const node2 = document.querySelector('[data-tab-id="14"]');
      assert.isFalse(browser.tabs.move.called, 'not called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isFalse(updateFunc.called, 'called');
      assert.isFalse(nodeParent === parent, 'parent');
      assert.isFalse(nodeParent === parent2, 'parent');
      assert.isFalse(nodeParent === parent3, 'parent');
      assert.isTrue(nodeParent === parent3.nextElementSibling, 'parent');
      assert.isTrue(nodeParent.classList.contains(CLASS_TAB_GROUP), 'class');
      assert.isTrue(node === nodeParent.firstElementChild, 'node');
      assert.isTrue(node === node2.previousElementSibling, 'node');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 5,
        dragWindowId: 2,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [5],
        tabGroup: false,
        tabIds: [7]
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          if (id === 7) {
            tab.active = true;
          } else {
            tab.active = false;
          }
          tabArr.push(tab);
        }
        return tabArr;
      });
      const highlightFunc = browser.tabs.highlight.withArgs({
        tabs: [3, 2],
        windowId: 1
      }).resolves({});
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm2, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isTrue(highlightFunc.called, 'called');
      assert.isFalse(updateFunc.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 5,
        dragWindowId: 2,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [5],
        tabGroup: false,
        tabIds: [7]
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          if (id === 7) {
            tab.active = true;
          } else {
            tab.active = false;
          }
          tabArr.push(tab);
        }
        return tabArr;
      });
      const highlightFunc = browser.tabs.highlight.withArgs({
        tabs: [2, 1],
        windowId: 1
      }).resolves({});
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm2, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isTrue(highlightFunc.called, 'called');
      assert.isFalse(updateFunc.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 5,
        dragWindowId: 2,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [5],
        tabGroup: false,
        tabIds: [7]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        return {
          id
        };
      });
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm2, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isTrue(updateFunc.called, 'called');
      assert.deepEqual(res, {
        id: 15
      }, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 5,
        dragWindowId: 2,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [5],
        tabGroup: false,
        tabIds: [7]
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          if (id === 7) {
            tab.active = true;
          } else {
            tab.active = false;
          }
          tabArr.push(tab);
        }
        return tabArr;
      });
      const highlightFunc = browser.tabs.highlight.withArgs({
        tabs: [4, 3],
        windowId: 1
      }).resolves({});
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm3, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isTrue(highlightFunc.called, 'called');
      assert.isFalse(updateFunc.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 5,
        dragWindowId: 2,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'move',
        dropWindowId: 1,
        pinnedTabIds: [5],
        tabGroup: false,
        tabIds: [7]
      };
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          if (id === 7) {
            tab.active = true;
          } else {
            tab.active = false;
          }
          tabArr.push(tab);
        }
        return tabArr;
      });
      const highlightFunc = browser.tabs.highlight.withArgs({
        tabs: [3, 2],
        windowId: 1
      }).resolves({});
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm3, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isFalse(browser.tabs.duplicate.called, 'not called');
      assert.isTrue(highlightFunc.called, 'called');
      assert.isFalse(updateFunc.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 5,
        dragWindowId: 2,
        dropAfter: true,
        dropBefore: false,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [5],
        tabGroup: false,
        tabIds: [7]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        return {
          id
        };
      });
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm3, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isTrue(updateFunc.called, 'called');
      assert.deepEqual(res, {
        id: 15
      }, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const data = {
        beGrouped: false,
        dragTabId: 5,
        dragWindowId: 2,
        dropAfter: false,
        dropBefore: true,
        dropEffect: 'copy',
        dropWindowId: 1,
        pinnedTabIds: [5],
        tabGroup: false,
        tabIds: [7]
      };
      const dupeFunc = browser.tabs.duplicate.callsFake(i => {
        const id = i + 10;
        return {
          id
        };
      });
      const moveFunc = browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const id = arr[i];
          const tab = {
            id,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      const updateFunc = browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const res = await func(elm3, data);
      assert.isTrue(moveFunc.called, 'called');
      assert.isTrue(dupeFunc.called, 'called');
      assert.isFalse(browser.tabs.highlight.called, 'not called');
      assert.isTrue(updateFunc.called, 'called');
      assert.deepEqual(res, {
        id: 15
      }, 'result');
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
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      body.appendChild(elm5);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm5,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: []
        },
        type: 'drop'
      };
      const res = await func(evt, {
        windowId: 1
      });
      assert.isFalse(preventDefault.called, 'called');
      assert.isFalse(stopPropagation.called, 'called');
      assert.isFalse(getCurrentWin.called, 'not called');
      assert.isFalse(portPostMsg.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
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
      const res = await func(evt, {
        windowId: 1
      });
      assert.isFalse(preventDefault.called, 'called');
      assert.isFalse(stopPropagation.called, 'called');
      assert.isFalse(getCurrentWin.called, 'not called');
      assert.isFalse(portPostMsg.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
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
      elm.classList.add(DROP_TARGET);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isFalse(getCurrentWin.called, 'not called');
      assert.isFalse(portPostMsg.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
        pinned: true
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
      elm.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('div');
      const heading2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      heading.classList.add(CLASS_HEADING);
      heading2.classList.add(CLASS_HEADING);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(heading2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: heading,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      heading.classList.add(DROP_TARGET, DROP_TARGET_AFTER);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const head = document.createElement('div');
      const head2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      head.classList.add(CLASS_HEADING);
      head2.classList.add(CLASS_HEADING);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(head2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
        pinned: false
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm3,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      elm3.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const head = document.createElement('div');
      const head2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      head.classList.add(CLASS_HEADING);
      head.hidden = true;
      head2.classList.add(CLASS_HEADING);
      head2.hidden = true;
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(head2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
        pinned: false
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm3,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      elm3.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const head = document.createElement('div');
      const head2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      head.classList.add(CLASS_HEADING);
      head.hidden = true;
      head2.classList.add(CLASS_HEADING);
      head2.hidden = true;
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(head2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
        pinned: false
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        shiftKey: true,
        preventDefault,
        stopPropagation,
        currentTarget: elm3,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      elm3.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const head = document.createElement('div');
      const head2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      head.classList.add(CLASS_HEADING);
      head.hidden = true;
      head2.classList.add(CLASS_HEADING);
      head2.hidden = true;
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(head2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
        pinned: false
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm4,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      elm4.classList.add(DROP_TARGET, DROP_TARGET_AFTER);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const head = document.createElement('div');
      const head2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      head.classList.add(CLASS_HEADING);
      head.hidden = true;
      head2.classList.add(CLASS_HEADING);
      head2.hidden = true;
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(head2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
        pinned: false
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm4,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      elm4.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const head = document.createElement('div');
      const head2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      head.classList.add(CLASS_HEADING);
      head.hidden = true;
      head2.classList.add(CLASS_HEADING);
      head2.hidden = true;
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        url: 'https://example.com/qux',
        title: 'Qux'
      });
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(head2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      parent2.appendChild(elm5);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
        pinned: false
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm4,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      elm4.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
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
      elm.classList.add(DROP_TARGET);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('div');
      const heading2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      heading.classList.add(CLASS_HEADING);
      heading2.classList.add(CLASS_HEADING);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(heading2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('https://example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: heading,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_URI]
        },
        type: 'drop'
      };
      heading.classList.add(DROP_TARGET, DROP_TARGET_AFTER);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
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
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'drop'
      };
      elm.classList.add(DROP_TARGET);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('div');
      const heading2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      heading.classList.add(CLASS_HEADING);
      heading2.classList.add(CLASS_HEADING);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(heading2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
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
        currentTarget: heading,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'drop'
      };
      heading.classList.add(DROP_TARGET, DROP_TARGET_AFTER);
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('https://example.com');
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
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.windows.get.withArgs(1, { populate: true }).resolves({
        id: 1,
        incognito: false,
        tabs: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      });
      browser.windows.get.withArgs(2, { populate: true }).resolves({
        id: 2,
        incognito: false,
        tabs: [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]
      });
      browser.tabs.get.callsFake(tabId => {
        const tab = {
          id: tabId
        };
        return tab;
      });
      browser.tabs.duplicate.callsFake(i => {
        const tabId = i + 10;
        return {
          id: tabId
        };
      });
      browser.tabs.highlight.resolves({});
      const getCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      let id = 10;
      browser.tabs.create.callsFake(opt => {
        const tab = {
          id: ++id
        };
        return tab;
      });
      browser.tabs.move.callsFake((arr, opt) => {
        const { index } = opt;
        const tabArr = [];
        for (let i = 0; i < arr.length; i++) {
          const tabId = arr[i];
          const tab = {
            id: tabId,
            index: index + i
          };
          tabArr.push(tab);
        }
        return tabArr;
      });
      browser.tabs.update.callsFake(tabId => {
        return {
          id: tabId
        };
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const portPostMsg = port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const main = document.createElement('div');
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent.id = PINNED;
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      main.appendChild(parent);
      main.appendChild(parent2);
      body.appendChild(tmpl);
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
      const res = await func(evt, {
        windowId: 1
      });
      assert.isTrue(preventDefault.called, 'called');
      assert.isTrue(stopPropagation.called, 'called');
      assert.isTrue(getCurrentWin.called, 'called');
      assert.isTrue(portPostMsg.called, 'called');
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

    it('should not remove class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const evt = {
        currentTarget: elm,
        type: 'foo'
      };
      func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should remove class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const evt = {
        currentTarget: elm,
        type: 'dragleave'
      };
      func(evt);
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should remove class', () => {
      const parent = document.createElement('div');
      const heading = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      heading.classList.add(CLASS_HEADING, DROP_TARGET, DROP_TARGET_AFTER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(heading);
      parent.appendChild(elm);
      body.appendChild(parent);
      const evt = {
        currentTarget: heading,
        type: 'dragleave'
      };
      func(evt);
      assert.isFalse(heading.classList.contains(DROP_TARGET), 'class');
    });

    it('should not remove class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      parent.appendChild(elm);
      body.appendChild(parent);
      const evt = {
        currentTarget: elm2,
        type: 'dragleave'
      };
      func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'class');
    });
  });

  describe('handle dragover', () => {
    const func = mjs.handleDragOver;

    it('should not set drop effect', () => {
      const parent = document.createElement('div');
      const heading = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      heading.classList.add(CLASS_HEADING);
      heading.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 60, left: 0, right: 100, bottom: 100
      });
      parent.appendChild(heading);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
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
      func(evt, {
        windowId: 1
      });
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.isUndefined(evt.dataTransfer.dropEffect, 'drop effect');
      assert.strictEqual(preventDefault.callCount, i, 'not called');
      assert.strictEqual(stopPropagation.callCount, j, 'not called');
    });

    it('should not set drop effect', () => {
      const parent = document.createElement('div');
      const heading = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      heading.classList.add(CLASS_HEADING);
      heading.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 60, left: 0, right: 100, bottom: 100
      });
      parent.appendChild(heading);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
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
        currentTarget: heading,
        dataTransfer: {
          getData,
          types: [MIME_JSON]
        },
        type: 'foo'
      };
      func(evt, {
        windowId: 1
      });
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.isFalse(heading.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(heading.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(heading.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.isUndefined(evt.dataTransfer.dropEffect, 'drop effect');
      assert.strictEqual(preventDefault.callCount, i, 'not called');
      assert.strictEqual(stopPropagation.callCount, j, 'not called');
    });

    it('should not set drop effect', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
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
          types: ['foo']
        },
        type: 'dragover'
      };
      func(evt, {
        windowId: 1
      });
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.isUndefined(evt.dataTransfer.dropEffect, 'drop effect');
      assert.strictEqual(preventDefault.callCount, i, 'not called');
      assert.strictEqual(stopPropagation.callCount, j, 'not called');
    });

    it('should set drop effect none', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
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
      func(evt, {
        windowId: 1
      });
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'none', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 2,
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
      func(evt, {
        windowId: 1
      });
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', () => {
      const parent = document.createElement('div');
      const heading = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      heading.classList.add(CLASS_HEADING);
      heading.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 60, left: 0, right: 100, bottom: 100
      });
      parent.appendChild(heading);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 2,
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
        currentTarget: heading,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      func(evt, {
        windowId: 1
      });
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.isTrue(heading.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(heading.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(heading.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should not set drop effect and class', () => {
      const parent = document.createElement('div');
      const heading = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      heading.classList.add(CLASS_HEADING);
      heading.hidden = true;
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 60, left: 0, right: 100, bottom: 100
      });
      parent.appendChild(heading);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 2,
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
        currentTarget: heading,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      func(evt, {
        windowId: 1
      });
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.isFalse(heading.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(heading.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(heading.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect none and remove class', () => {
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
        dragWindowId: 1,
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
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      func(evt, {
        windowId: 1
      });
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'none', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', () => {
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
        dragWindowId: 2,
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
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      func(evt, {
        windowId: 1
      });
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
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
      func(evt, {
        windowId: 1
      });
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
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
      func(evt, {
        windowId: 1
      });
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isTrue(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        ctrlKey: true,
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
      func(evt, {
        windowId: 1
      });
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'copy', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        dragWindowId: 1,
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        altKey: true,
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
      func(evt, {
        isMac: true,
        windowId: 1
      });
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'copy', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      elm.classList.add(TAB, PINNED);
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
      func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set class', () => {
      const parent = document.createElement('div');
      const heading = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      heading.classList.add(CLASS_HEADING);
      heading.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 60, left: 0, right: 100, bottom: 100
      });
      parent.appendChild(heading);
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
        currentTarget: heading,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'dragover'
      };
      func(evt);
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.isTrue(heading.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(heading.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(heading.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      elm.classList.add(TAB, PINNED);
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
      func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isTrue(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set class', () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, PINNED);
      elm.classList.add(TAB, PINNED);
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
      func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should prevent default', () => {
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
      func(evt);
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });
  });

  describe('handle dragstart', () => {
    const func = mjs.handleDragStart;

    it('should get undefined', () => {
      const res = func({
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
      browser.tabs.update.resolves({
        active: true,
        id: 1,
        index: 0
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false,
        windowId: 1
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 1,
        dragWindowId: 1,
        tabGroup: false,
        pinned: true,
        pinnedTabIds: [1],
        tabIds: []
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 1,
        index: 0
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 1,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: true,
        pinnedTabIds: [1],
        tabIds: []
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 3,
        index: 2
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3]
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 1,
        index: 0
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED, HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        shiftKey: true,
        currentTarget: elm,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 1,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: true,
        pinnedTabIds: [1, 2],
        tabIds: []
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 1,
        index: 0
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED, HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED, HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        shiftKey: true,
        currentTarget: elm,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 1,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: true,
        pinnedTabIds: [1, 2],
        tabIds: []
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 3,
        index: 2
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB, HIGHLIGHTED);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        shiftKey: true,
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 3,
        index: 2
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB, HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB, HIGHLIGHTED);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        shiftKey: true,
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 3,
        index: 2
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        ctrlKey: true,
        shiftKey: true,
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: true,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 3,
        index: 2
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: true
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        metaKey: true,
        shiftKey: true,
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: true,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 3,
        index: 2
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB, HIGHLIGHTED);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        ctrlKey: true,
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 3,
        index: 2
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB, HIGHLIGHTED);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: true
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        metaKey: true,
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 3,
        index: 2
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB, HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB, HIGHLIGHTED);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        ctrlKey: true,
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 3,
        index: 2
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB, HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB, HIGHLIGHTED);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: true
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        metaKey: true,
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [MIME_JSON], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      browser.tabs.update.resolves({
        active: true,
        id: 3,
        index: 2
      });
      browser.tabs.highlight.resolves({});
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER, CLASS_TAB_GROUP);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com',
        title: 'Example Domain'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo',
        title: 'Foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar',
        title: 'Bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz',
        title: 'Baz'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      const dataTypes = [];
      let parsedData;
      const evt = {
        altKey: true,
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            dataTypes.push(type);
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
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(dataTypes, [
        MIME_JSON,
        MIME_MOZ_URL,
        MIME_PLAIN
      ], 'types');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3]
      }, 'data');
      assert.deepEqual(res, [{}], 'result');
    });
  });
});
