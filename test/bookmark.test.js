/**
 * bookmark.test.js
 */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';
import { HIGHLIGHTED, TAB } from '../src/mjs/constant.js';

/* test */
import * as mjs from '../src/mjs/bookmark.js';

describe('bookmark', () => {
  const globalKeys = ['Node'];
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

  describe('bookmark tabs', () => {
    const func = mjs.bookmarkTabs;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not array', async () => {
      await func(1).catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Number.',
          'throw');
      });
    });

    it('should not call function if argument is empty array', async () => {
      const i = browser.bookmarks.create.callCount;
      const res = await func([]);
      assert.strictEqual(browser.bookmarks.create.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element not contained', async () => {
      const i = browser.bookmarks.create.callCount;
      const res = await func(['foo']);
      assert.strictEqual(browser.bookmarks.create.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not tab', async () => {
      const i = browser.bookmarks.create.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.bookmarks.create.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.bookmarks.create.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tab = JSON.stringify({
        title: 'foo',
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tab = JSON.stringify({
        title: 'bar',
        url: 'https://www.example.com'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tab = JSON.stringify({
        title: 'baz',
        url: 'http://example.com'
      });
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      const items = document.querySelectorAll(`.${HIGHLIGHTED}`);
      const res = await func(Array.from(items));
      assert.strictEqual(browser.bookmarks.create.callCount, i, 'not called');
      assert.deepEqual(res, [null, null], 'result');
    });

    it('should call function', async () => {
      browser.bookmarks.create.withArgs({
        title: 'foo',
        url: 'https://example.com'
      }).resolves('foo');
      browser.bookmarks.create.withArgs({
        title: 'bar',
        url: 'https://www.example.com'
      }).resolves('bar');
      const i = browser.bookmarks.create.withArgs({
        title: 'foo',
        url: 'https://example.com'
      }).callCount;
      const j = browser.bookmarks.create.withArgs({
        title: 'bar',
        url: 'https://www.example.com'
      }).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tab = JSON.stringify({
        title: 'foo',
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tab = JSON.stringify({
        title: 'bar',
        url: 'https://www.example.com'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tab = JSON.stringify({
        title: 'baz',
        url: 'http://example.com'
      });
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      const items = document.querySelectorAll(`.${HIGHLIGHTED}`);
      const res = await func(Array.from(items));
      assert.strictEqual(browser.bookmarks.create.withArgs({
        title: 'foo',
        url: 'https://example.com'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.bookmarks.create.withArgs({
        title: 'bar',
        url: 'https://www.example.com'
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, ['foo', 'bar'], 'result');
    });
  });
});
