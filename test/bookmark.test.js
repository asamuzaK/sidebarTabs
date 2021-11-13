/**
 * bookmark.test.js
 */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';
import { BOOKMARK_LOCATION, HIGHLIGHTED, TAB } from '../src/mjs/constant.js';

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

  describe('create folder map', () => {
    const func = mjs.createFolderMap;
    beforeEach(() => {
      const { folderMap } = mjs;
      folderMap.clear();
    });
    afterEach(() => {
      const { folderMap } = mjs;
      folderMap.clear();
    });

    it('should get map of size 0', () => {
      const res = func();
      assert.instanceOf(res, Map, 'map');
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should get map of size 0', () => {
      const res = func({});
      assert.instanceOf(res, Map, 'map');
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should get map of size 0', () => {
      const tree = {
        type: 'foo'
      };
      const res = func(tree);
      assert.instanceOf(res, Map, 'map');
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should get map of size 0', () => {
      const tree = {
        type: 'folder'
      };
      const res = func(tree);
      assert.instanceOf(res, Map, 'map');
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should get map', () => {
      const tree = {
        id: 'foo',
        type: 'folder'
      };
      const res = func(tree);
      assert.instanceOf(res, Map, 'map');
      assert.strictEqual(res.size, 1, 'size');
      assert.isTrue(res.has('foo'), 'key');
    });

    it('should get map', () => {
      const tree = {
        children: [
          {
            children: [{
              id: 'quux',
              parentId: 'bar',
              type: 'folder'
            }],
            id: 'bar',
            parentId: 'foo',
            type: 'folder'
          },
          {
            id: 'baz',
            parentId: 'foo',
            type: 'folder'
          },
          {
            id: 'qux',
            parentId: 'foo',
            type: 'bookmark'
          }
        ],
        id: 'foo',
        type: 'folder'
      };
      const res = func(tree);
      assert.instanceOf(res, Map, 'map');
      assert.strictEqual(res.size, 3, 'size');
      assert.isTrue(res.has('foo'), 'key');
      assert.deepEqual(Array.from(res.get('foo').children), [
        'bar',
        'baz'
      ], 'set');
      assert.isTrue(res.has('bar'), 'key');
      assert.deepEqual(Array.from(res.get('bar').children), [], 'set');
      assert.isTrue(res.has('baz'), 'key');
      assert.isFalse(res.has('qux'), 'key');
      assert.isFalse(res.has('quux'), 'key');
    });

    it('should get map', () => {
      const tree = {
        children: [
          {
            children: [{
              id: 'quux',
              parentId: 'bar',
              type: 'folder'
            }],
            id: 'bar',
            parentId: 'foo',
            type: 'folder'
          },
          {
            id: 'baz',
            parentId: 'foo',
            type: 'folder'
          },
          {
            id: 'qux',
            parentId: 'foo',
            type: 'bookmark'
          }
        ],
        id: 'foo',
        type: 'folder'
      };
      const res = func(tree, true);
      assert.instanceOf(res, Map, 'map');
      assert.strictEqual(res.size, 4, 'size');
      assert.isTrue(res.has('foo'), 'key');
      assert.deepEqual(Array.from(res.get('foo').children), [
        'bar',
        'baz'
      ], 'set');
      assert.isTrue(res.has('bar'), 'key');
      assert.deepEqual(Array.from(res.get('bar').children), ['quux'], 'set');
      assert.isTrue(res.has('baz'), 'key');
      assert.isFalse(res.has('qux'), 'key');
      assert.isTrue(res.has('quux'), 'key');
    });
  });

  describe('get refreshed folder map', () => {
    const func = mjs.getRefreshedFolderMap;
    beforeEach(() => {
      const { folderMap } = mjs;
      folderMap.clear();
    });
    afterEach(() => {
      const { folderMap } = mjs;
      folderMap.clear();
    });

    it('should get map', async () => {
      browser.bookmarks.getTree.resolves([{
        children: [
          {
            children: [{
              id: 'quux',
              parentId: 'bar',
              type: 'folder'
            }],
            id: 'bar',
            parentId: 'foo',
            type: 'folder'
          },
          {
            id: 'baz',
            parentId: 'foo',
            type: 'folder'
          },
          {
            id: 'qux',
            parentId: 'foo',
            type: 'bookmark'
          }
        ],
        id: 'foo',
        type: 'folder'
      }]);
      const res = await func();
      assert.instanceOf(res, Map, 'map');
      assert.strictEqual(res.size, 3, 'size');
      assert.isTrue(res.has('foo'), 'key');
      assert.deepEqual(Array.from(res.get('foo').children), [
        'bar',
        'baz'
      ], 'set');
      assert.isTrue(res.has('bar'), 'key');
      assert.deepEqual(Array.from(res.get('bar').children), [], 'set');
      assert.isTrue(res.has('baz'), 'key');
      assert.isFalse(res.has('qux'), 'key');
      assert.isFalse(res.has('quux'), 'key');
    });

    it('should get map', async () => {
      browser.bookmarks.getTree.resolves([{
        children: [
          {
            children: [{
              id: 'quux',
              parentId: 'bar',
              type: 'folder'
            }],
            id: 'bar',
            parentId: 'foo',
            type: 'folder'
          },
          {
            id: 'baz',
            parentId: 'foo',
            type: 'folder'
          },
          {
            id: 'qux',
            parentId: 'foo',
            type: 'bookmark'
          }
        ],
        id: 'foo',
        type: 'folder'
      }]);
      const res = await func(true);
      assert.instanceOf(res, Map, 'map');
      assert.strictEqual(res.size, 4, 'size');
      assert.isTrue(res.has('foo'), 'key');
      assert.deepEqual(Array.from(res.get('foo').children), [
        'bar',
        'baz'
      ], 'set');
      assert.isTrue(res.has('bar'), 'key');
      assert.deepEqual(Array.from(res.get('bar').children), ['quux'], 'set');
      assert.isTrue(res.has('baz'), 'key');
      assert.isFalse(res.has('qux'), 'key');
      assert.isTrue(res.has('quux'), 'key');
    });
  });

  describe('get bookmark location ID from storage', () => {
    const func = mjs.getBookmarkLocationId;
    beforeEach(() => {
      const { folderMap } = mjs;
      folderMap.clear();
    });
    afterEach(() => {
      const { folderMap } = mjs;
      folderMap.clear();
    });

    it('should get null', async () => {
      browser.storage.local.get.withArgs(BOOKMARK_LOCATION).resolves(undefined);
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      browser.storage.local.get.withArgs(BOOKMARK_LOCATION).resolves({
        foo: {
          value: 'bar'
        }
      });
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      browser.storage.local.get.withArgs(BOOKMARK_LOCATION).resolves({
        [BOOKMARK_LOCATION]: {
          value: 'foobar'
        }
      });
      browser.bookmarks.get.withArgs('foobar').rejects(new Error('error'));
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      browser.storage.local.get.withArgs(BOOKMARK_LOCATION).resolves({
        [BOOKMARK_LOCATION]: {
          value: 'bar'
        }
      });
      browser.bookmarks.get.withArgs('bar').resolves([{
        foo: 'bar'
      }]);
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      browser.storage.local.get.withArgs(BOOKMARK_LOCATION).resolves({
        [BOOKMARK_LOCATION]: {
          value: 'bar'
        }
      });
      browser.bookmarks.get.withArgs('bar').resolves([{
        children: [{
          id: 'quux',
          parentId: 'bar',
          type: 'folder'
        }],
        id: 'bar',
        parentId: 'foo',
        type: 'folder'
      }]);
      const res = await func();
      assert.strictEqual(res, 'bar', 'result');
    });
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
        parentId: undefined,
        title: 'foo',
        url: 'https://example.com'
      }).resolves('foo');
      const i = browser.bookmarks.create.withArgs({
        parentId: undefined,
        title: 'foo',
        url: 'https://example.com'
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
        parentId: undefined,
        title: 'foo',
        url: 'https://example.com'
      }).callCount, i + 1, 'called');
      assert.deepEqual(res, ['foo'], 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.withArgs(BOOKMARK_LOCATION).resolves({
        [BOOKMARK_LOCATION]: {
          value: 'bar'
        }
      });
      browser.bookmarks.get.withArgs('bar').resolves([{
        children: [{
          id: 'quux',
          parentId: 'bar',
          type: 'folder'
        }],
        id: 'bar',
        parentId: 'foo',
        type: 'folder'
      }]);
      browser.bookmarks.create.withArgs({
        parentId: 'bar',
        title: 'foo',
        url: 'https://example.com'
      }).resolves('bar');
      const i = browser.bookmarks.create.withArgs({
        parentId: 'bar',
        title: 'foo',
        url: 'https://example.com'
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
        parentId: 'bar',
        title: 'foo',
        url: 'https://example.com'
      }).callCount, i + 1, 'called');
      assert.deepEqual(res, ['bar'], 'result');
    });

    it('should call function', async () => {
      window.prompt.returns('foobar');
      browser.bookmarks.create.withArgs({
        parentId: undefined,
        title: 'foobar',
        type: 'folder'
      }).resolves({
        id: 'foobar_folder'
      });
      browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
        title: 'foo',
        url: 'https://example.com'
      }).resolves('foo');
      browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
        title: 'bar',
        url: 'https://www.example.com'
      }).resolves('bar');
      const i = browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
        title: 'foo',
        url: 'https://example.com'
      }).callCount;
      const j = browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
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
        parentId: 'foobar_folder',
        title: 'foo',
        url: 'https://example.com'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
        title: 'bar',
        url: 'https://www.example.com'
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, ['foo', 'bar'], 'result');
    });

    it('should call function', async () => {
      window.prompt.withArgs('Input folder name', 'foobar').returns('foobar');
      browser.bookmarks.create.withArgs({
        parentId: undefined,
        title: 'foobar',
        type: 'folder'
      }).resolves({
        id: 'foobar_folder'
      });
      browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
        title: 'foo',
        url: 'https://example.com'
      }).resolves('foo');
      browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
        title: 'bar',
        url: 'https://www.example.com'
      }).resolves('bar');
      const i = browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
        title: 'foo',
        url: 'https://example.com'
      }).callCount;
      const j = browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
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
      const res = await func(Array.from(items), 'foobar');
      assert.strictEqual(browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
        title: 'foo',
        url: 'https://example.com'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.bookmarks.create.withArgs({
        parentId: 'foobar_folder',
        title: 'bar',
        url: 'https://www.example.com'
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, ['foo', 'bar'], 'result');
    });
  });
});
