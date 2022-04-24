/**
 * menu.test.js
 */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';
import sinon from 'sinon';

/* test */
import * as mjs from '../src/mjs/menu.js';

describe('menu', () => {
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
  });
  afterEach(() => {
    window = null;
    document = null;
    delete global.browser;
    delete global.window;
    delete global.document;
    browser._sandbox.reset();
  });

  it('should get browser object', () => {
    assert.isObject(browser, 'browser');
  });

  describe('update context menu', () => {
    const func = mjs.updateContextMenu;

    it('should not call function if 1st arg is not given', async () => {
      const i = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if 1st arg is not string', async () => {
      const i = browser.menus.update.callCount;
      const res = await func(1);
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if 2nd arg is not given', async () => {
      const i = browser.menus.update.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if 2nd arg is empty object', async () => {
      const i = browser.menus.update.callCount;
      const res = await func('foo', {});
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if prop does not match', async () => {
      const i = browser.menus.update.callCount;
      const res = await func('foo', {
        bar: 'baz'
      });
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const res = await func('foo', {
        enabled: true
      });
      assert.strictEqual(browser.menus.update.callCount, i + 1, 'called');
      assert.deepEqual(res, [undefined], 'result');
    });
  });

  describe('handle create menu item last error', () => {
    const func = mjs.createMenuItemCallback;
    beforeEach(() => {
      const { menuItemMap } = mjs;
      menuItemMap.clear();
      browser.runtime.lastError = null;
    });
    afterEach(() => {
      const { menuItemMap } = mjs;
      menuItemMap.clear();
      browser.runtime.lastError = null;
    });

    it('should not call function', async () => {
      const i = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should throw', async () => {
      browser.runtime.lastError = new Error('unknown error');
      const i = browser.menus.update.callCount;
      assert.throws(() => func(), 'unknown error', 'error');
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
    });

    it('should throw', async () => {
      browser.runtime.lastError = new Error('ID already exists: foo');
      const i = browser.menus.update.callCount;
      assert.throws(() => func(), 'ID already exists: foo', 'error');
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
    });

    it('should throw', async () => {
      browser.runtime.lastError = new Error('ID already exists: foo');
      mjs.menuItemMap.set('foo', null);
      const i = browser.menus.update.callCount;
      assert.throws(() => func(), 'ID already exists: foo', 'error');
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
    });

    it('should call function', async () => {
      browser.runtime.lastError = new Error('ID already exists: foo');
      mjs.menuItemMap.set('foo', { enabled: true });
      const i = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.update.callCount, i + 1, 'called');
      assert.deepEqual(res, [[undefined]]);
    });
  });

  describe('create context menu item', () => {
    const func = mjs.createMenuItem;

    it('should not call function if no argument given', async () => {
      const i = browser.menus.create.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.create.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function if argument is empty object', async () => {
      const i = browser.menus.create.callCount;
      const res = await func({});
      assert.strictEqual(browser.menus.create.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function if object does not contain id', async () => {
      const i = browser.menus.create.callCount;
      const res = await func({
        foo: 'bar'
      });
      assert.strictEqual(browser.menus.create.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function if id is not string', async () => {
      const i = browser.menus.create.callCount;
      const res = await func({
        id: []
      });
      assert.strictEqual(browser.menus.create.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.menus.create.resolves('foo');
      const i = browser.menus.create.callCount;
      const res = await func({
        id: 'foo'
      });
      assert.strictEqual(browser.menus.create.callCount, i + 1, 'called');
      assert.strictEqual(res, 'foo', 'result');
    });
  });

  describe('create contextual identities menu', () => {
    const func = mjs.createContextualIdentitiesMenu;

    it('should not call function', async () => {
      const i = browser.menus.create.callCount;
      await func();
      assert.strictEqual(browser.menus.create.callCount, i, 'not called');
    });

    it('should not call function if argument is empty object', async () => {
      const i = browser.menus.create.callCount;
      await func({});
      assert.strictEqual(browser.menus.create.callCount, i, 'not called');
    });

    it('should throw if color not contained', async () => {
      await func({
        foo: 'bar'
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should throw if cookieStoreId not contained', async () => {
      await func({
        color: 'red'
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should throw if icon not contained', async () => {
      await func({
        color: 'red',
        cookieStoreId: 'foo'
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should throw if name not contained', async () => {
      await func({
        color: 'red',
        cookieStoreId: 'foo',
        icon: 'fingerprint'
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should call function', async () => {
      const i = browser.menus.create.callCount;
      const res = await func({
        color: 'red',
        cookieStoreId: 'foo',
        icon: 'fingerprint',
        name: 'bar'
      });
      assert.strictEqual(browser.menus.create.callCount, i + 2, 'called');
      assert.deepEqual(res, [null, null], 'result');
    });
  });

  describe('create context menu', () => {
    const func = mjs.createContextMenu;

    it('should get array', async () => {
      browser.contextualIdentities.query.withArgs({}).resolves([{}, {}]);
      const i = browser.contextualIdentities.query.callCount;
      const res = await func();
      assert.strictEqual(browser.contextualIdentities.query.callCount, i + 1,
        'called');
      assert.isTrue(res.length > 0, 'result');
    });

    it('should get array', async () => {
      browser.contextualIdentities.query.withArgs({}).resolves(null);
      const i = browser.contextualIdentities.query.callCount;
      const res = await func();
      assert.strictEqual(browser.contextualIdentities.query.callCount, i + 1,
        'called');
      assert.isTrue(res.length > 0, 'result');
    });
  });

  describe('update contextual identities menu', () => {
    const func = mjs.updateContextualIdentitiesMenu;

    it('should not call function', async () => {
      const i = browser.menus.update.callCount;
      await func();
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
    });

    it('should not call function', async () => {
      const i = browser.menus.update.callCount;
      await func({
        foo: {}
      });
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
    });

    it('should throw if color not contained', async () => {
      await func({
        contextualIdentity: {
          foo: 'bar'
        }
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should throw if cookieStoreId not contained', async () => {
      await func({
        contextualIdentity: {
          color: 'red'
        }
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should throw if icon not contained', async () => {
      await func({
        contextualIdentity: {
          color: 'red',
          cookieStoreId: 'foo'
        }
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should throw if name not contained', async () => {
      await func({
        contextualIdentity: {
          color: 'red',
          cookieStoreId: 'foo',
          icon: 'fingerprint'
        }
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const res = await func({
        contextualIdentity: {
          color: 'red',
          cookieStoreId: 'foo',
          icon: 'fingerprint',
          name: 'bar'
        }
      });
      assert.strictEqual(browser.menus.update.callCount, i + 2, 'called');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });
  });

  describe('remove contextual identities menu', () => {
    const func = mjs.removeContextualIdentitiesMenu;

    it('should not call function if no argument given', async () => {
      const i = browser.menus.remove.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.remove.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if argument is empty object', async () => {
      const i = browser.menus.remove.callCount;
      const res = await func({});
      assert.strictEqual(browser.menus.remove.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if cookieStoreId not contained', async () => {
      const i = browser.menus.remove.callCount;
      const res = await func({
        foo: 'bar'
      });
      assert.strictEqual(browser.menus.remove.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.remove.callCount;
      const res = await func({
        cookieStoreId: 'foo'
      });
      assert.strictEqual(browser.menus.remove.callCount, i + 2, 'called');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });
  });

  describe('restore context menu', () => {
    const func = mjs.restoreContextMenu;

    it('should get array', async () => {
      const remove = browser.menus.removeAll.resolves(undefined);
      const create = browser.menus.create;
      const res = await func();
      assert.isTrue(remove.calledOnce, 'called');
      assert.isTrue(create.called, 'called');
      assert.isArray(res, 'result');
    });
  });

  describe('override context menu', () => {
    const func = mjs.overrideContextMenu;
    beforeEach(() => {
      if (typeof browser.menus.overrideContext !== 'function') {
        browser.menus.overrideContext = sinon.stub();
      }
    });

    it('should call function with empty object argument', async () => {
      const i = browser.menus.overrideContext.withArgs({}).callCount;
      const res = await func();
      assert.strictEqual(browser.menus.overrideContext.withArgs({}).callCount,
        i + 1, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function with empty object argument', async () => {
      const i = browser.menus.overrideContext.withArgs({}).callCount;
      const res = await func({});
      assert.strictEqual(browser.menus.overrideContext.withArgs({}).callCount,
        i + 1, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function with object argument', async () => {
      const opt = {
        tabId: 1,
        context: 'tab'
      };
      const i = browser.menus.overrideContext.withArgs(opt).callCount;
      const res = await func(opt);
      assert.strictEqual(browser.menus.overrideContext.withArgs(opt).callCount,
        i + 1, 'called');
      assert.isUndefined(res, 'result');
    });
  });
});
