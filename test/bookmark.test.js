/**
 * bookmark.test.js
 */
/* eslint-disable import/order */

/* api */
import sinon from 'sinon';
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';

/* test */
import * as mjs from '../src/mjs/bookmark.js';
import {
  BOOKMARK_FOLDER_MSG, BOOKMARK_LOCATION, HIGHLIGHTED, TAB
} from '../src/mjs/constant.js';

describe('bookmark', () => {
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

    it('should get map of size 0', async () => {
      const { folderMap } = mjs;
      await func();
      assert.strictEqual(folderMap.size, 0, 'size');
    });

    it('should get map of size 0', async () => {
      const { folderMap } = mjs;
      await func({});
      assert.strictEqual(folderMap.size, 0, 'size');
    });

    it('should get map of size 0', async () => {
      const { folderMap } = mjs;
      const tree = {
        type: 'foo'
      };
      await func(tree);
      assert.strictEqual(folderMap.size, 0, 'size');
    });

    it('should get map of size 0', async () => {
      const { folderMap } = mjs;
      const tree = {
        type: 'folder'
      };
      await func(tree);
      assert.strictEqual(folderMap.size, 0, 'size');
    });

    it('should get map', async () => {
      const { folderMap } = mjs;
      const tree = {
        id: 'foo',
        type: 'folder'
      };
      await func(tree);
      assert.isTrue(folderMap.has('foo'), 'key');
    });

    it('should get map', async () => {
      const { folderMap } = mjs;
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
      await func(tree);
      assert.strictEqual(folderMap.size, 3, 'size');
      assert.isTrue(folderMap.has('foo'), 'key');
      assert.deepEqual(Array.from(folderMap.get('foo').children), [
        'bar',
        'baz'
      ], 'set');
      assert.isTrue(folderMap.has('bar'), 'key');
      assert.deepEqual(Array.from(folderMap.get('bar').children), [], 'set');
      assert.isTrue(folderMap.has('baz'), 'key');
      assert.isFalse(folderMap.has('qux'), 'key');
      assert.isFalse(folderMap.has('quux'), 'key');
    });

    it('should get map', async () => {
      const { folderMap } = mjs;
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
      await func(tree, true);
      assert.strictEqual(folderMap.size, 4, 'size');
      assert.isTrue(folderMap.has('foo'), 'key');
      assert.deepEqual(Array.from(folderMap.get('foo').children), [
        'bar',
        'baz'
      ], 'set');
      assert.isTrue(folderMap.has('bar'), 'key');
      assert.deepEqual(Array.from(folderMap.get('bar').children), [
        'quux'
      ], 'set');
      assert.isTrue(folderMap.has('baz'), 'key');
      assert.isFalse(folderMap.has('qux'), 'key');
      assert.isTrue(folderMap.has('quux'), 'key');
    });
  });

  describe('get folder map', () => {
    const func = mjs.getFolderMap;
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
      let msg;
      const e = new Error('error');
      const stub = sinon.stub(console, 'error').callsFake(m => {
        msg = (m && m.message) || m;
      });
      browser.storage.local.get.withArgs(BOOKMARK_LOCATION).resolves({
        [BOOKMARK_LOCATION]: {
          value: 'foobar'
        }
      });
      browser.bookmarks.getSubTree.rejects(e);
      const res = await func();
      stub.restore();
      assert.strictEqual(msg, 'error', 'log');
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      browser.storage.local.get.withArgs(BOOKMARK_LOCATION).resolves({
        [BOOKMARK_LOCATION]: {
          value: 'bar'
        }
      });
      browser.bookmarks.getSubTree.withArgs('bar').resolves([{
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
      browser.bookmarks.getSubTree.withArgs('bar').resolves([{
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
      browser.bookmarks.getSubTree.withArgs('bar').resolves([{
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
      window.prompt.withArgs('foo', '').returns('foobar');
      browser.i18n.getMessage.withArgs(BOOKMARK_FOLDER_MSG).returns('foo');
      browser.bookmarks.create.withArgs({
        parentId: undefined,
        title: 'foo',
        url: 'https://example.com'
      }).resolves('foo');
      browser.bookmarks.create.withArgs({
        parentId: undefined,
        title: 'bar',
        url: 'https://www.example.com'
      }).resolves('bar');
      const i = browser.bookmarks.create.withArgs({
        parentId: undefined,
        title: 'foo',
        url: 'https://example.com'
      }).callCount;
      const j = browser.bookmarks.create.withArgs({
        parentId: undefined,
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
        parentId: undefined,
        title: 'foo',
        url: 'https://example.com'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.bookmarks.create.withArgs({
        parentId: undefined,
        title: 'bar',
        url: 'https://www.example.com'
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, ['foo', 'bar'], 'result');
    });

    it('should call function', async () => {
      window.prompt.withArgs('foo', '').returns('foobar');
      browser.i18n.getMessage.withArgs(BOOKMARK_FOLDER_MSG).returns('foo');
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
      window.prompt.withArgs('foo', 'foobar').returns('foobar');
      browser.i18n.getMessage.withArgs(BOOKMARK_FOLDER_MSG).returns('foo');
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
