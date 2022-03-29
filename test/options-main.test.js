/**
 * options-main.test.js
 */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';
import sinon from 'sinon';
import {
  BOOKMARK_LOCATION, BROWSER_SETTINGS_READ, EXT_INIT, MENU_SHOW_MOUSEUP,
  THEME_CUSTOM, THEME_CUSTOM_INIT, THEME_CUSTOM_SETTING, THEME_ID, THEME_LIST,
  THEME_RADIO, USER_CSS, USER_CSS_SAVE, USER_CSS_USE, USER_CSS_WARN
} from '../src/mjs/constant.js';

/* test */
import * as mjs from '../src/mjs/options-main.js';

describe('options-main', () => {
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

  describe('send message', () => {
    const func = mjs.sendMsg;

    it('should not call function if no argument given', async () => {
      const i = browser.runtime.sendMessage.callCount;
      await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
    });

    it('should not call function if argument is falsy', async () => {
      const i = browser.runtime.sendMessage.callCount;
      await func(false);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
    });

    it('should call function', async () => {
      const i = browser.runtime.sendMessage.callCount;
      await func({ foo: 'bar' });
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
    });
  });

  describe('init extension', () => {
    const func = mjs.initExt;

    it('should not call function if no argument given', async () => {
      const i = browser.runtime.sendMessage.callCount;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.runtime.sendMessage.callCount;
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('init custom theme', () => {
    const func = mjs.initCustomTheme;

    it('should not call function if no argument given', async () => {
      const i = browser.runtime.sendMessage.callCount;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.runtime.sendMessage.callCount;
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('request custom theme', () => {
    const func = mjs.requestCustomTheme;

    it('should not call function if no argument given', async () => {
      const i = browser.runtime.sendMessage.callCount;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.runtime.sendMessage.callCount;
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('store custom theme values', () => {
    const func = mjs.storeCustomTheme;

    it('should get null', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null if value is falsy', async () => {
      const themeId = document.createElement('input');
      themeId.id = THEME_ID;
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      const themeId = document.createElement('input');
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      themeId.id = THEME_ID;
      themeId.value = 'foo';
      elm.id = 'bar';
      elm.type = 'color';
      elm.value = '#123456';
      body.appendChild(themeId);
      body.appendChild(elm);
      browser.storage.local.get.withArgs(THEME_LIST).resolves({});
      const res = await func();
      assert.deepEqual(res, {
        [THEME_LIST]: {
          foo: {
            id: 'foo',
            values: {
              bar: '#123456'
            }
          }
        }
      }, 'result');
    });

    it('should get result', async () => {
      const themeId = document.createElement('input');
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      themeId.id = THEME_ID;
      themeId.value = 'foo';
      elm.id = 'bar';
      elm.type = 'color';
      elm.value = '#123456';
      body.appendChild(themeId);
      body.appendChild(elm);
      browser.storage.local.get.withArgs(THEME_LIST).resolves({
        [THEME_LIST]: {
          foo: {
            id: 'foo',
            values: {
              bar: '#000000'
            }
          }
        }
      });
      const res = await func();
      assert.deepEqual(res, {
        [THEME_LIST]: {
          foo: {
            id: 'foo',
            values: {
              bar: '#123456'
            }
          }
        }
      }, 'result');
    });
  });

  describe('create pref', () => {
    const func = mjs.createPref;

    it('should get null if argument not given', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get object', async () => {
      const res = await func({
        id: 'foo'
      });
      assert.deepEqual(res, {
        foo: {
          id: 'foo',
          checked: false,
          value: '',
          subItemOf: null
        }
      }, 'result');
    });
  });

  describe('store pref', () => {
    const func = mjs.storePref;

    it('should call function', async () => {
      const i = browser.storage.local.set.callCount;
      const evt = {
        target: {
          id: 'foo',
          type: 'text'
        }
      };
      const res = await func(evt);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.strictEqual(res.length, 1, 'array length');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('input');
      const elm2 = document.createElement('input');
      const body = document.querySelector('body');
      const evt = {
        target: {
          id: 'foo',
          name: 'bar',
          type: 'radio'
        }
      };
      elm.id = 'foo';
      elm.name = 'bar';
      elm.type = 'radio';
      elm2.id = 'baz';
      elm2.name = 'bar';
      elm2.type = 'radio';
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func(evt);
      assert.strictEqual(browser.storage.local.set.callCount, i + 2, 'called');
      assert.strictEqual(res.length, 2, 'array length');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.storage.local.set.callCount;
      const themeId = document.createElement('input');
      const elm = document.createElement('input');
      const elm2 = document.createElement('input');
      const body = document.querySelector('body');
      const evt = {
        target: {
          id: 'foo',
          name: 'bar',
          type: 'color'
        }
      };
      themeId.id = THEME_ID;
      themeId.value = 'foobar';
      elm.id = 'foo';
      elm.type = 'color';
      elm.value = '#000000';
      elm2.id = 'baz';
      elm2.type = 'color';
      elm.value = '#ffffff';
      body.appendChild(themeId);
      body.appendChild(elm);
      body.appendChild(elm2);
      browser.storage.local.get.withArgs(THEME_LIST).resolves({});
      const res = await func(evt);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.strictEqual(res.length, 1, 'array length');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should get array', async () => {
      const i = browser.permissions.request.callCount;
      const evt = {
        target: {
          id: BROWSER_SETTINGS_READ,
          checked: true
        }
      };
      const res = await func(evt);
      assert.strictEqual(browser.permissions.request.callCount, i + 1,
        'called');
      assert.strictEqual(res.length, 1, 'length');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should get array', async () => {
      const i = browser.permissions.remove.callCount;
      const evt = {
        target: {
          id: BROWSER_SETTINGS_READ,
          checked: false
        }
      };
      const res = await func(evt);
      assert.strictEqual(browser.permissions.remove.callCount, i + 1, 'called');
      assert.strictEqual(res.length, 1, 'length');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should get array', async () => {
      const i = browser.browserSettings.contextMenuShowEvent.get.callCount;
      const j = browser.browserSettings.contextMenuShowEvent.set.callCount;
      const k = window.alert.callCount;
      const evt = {
        target: {
          id: MENU_SHOW_MOUSEUP,
          checked: true
        }
      };
      browser.permissions.contains.resolves(true);
      browser.browserSettings.contextMenuShowEvent.get.resolves({
        value: 'mousedown',
        levelOfControl: 'controllable_by_this_extension'
      });
      browser.browserSettings.contextMenuShowEvent.set.resolves(true);
      const res = await func(evt);
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.get.callCount, i + 1,
        'called'
      );
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.set.callCount, j + 1,
        'called'
      );
      assert.strictEqual(window.alert.callCount, k, 'not called');
      assert.strictEqual(res.length, 1, 'length');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should get array', async () => {
      const i = browser.browserSettings.contextMenuShowEvent.get.callCount;
      const j = browser.browserSettings.contextMenuShowEvent.set.callCount;
      const k = window.alert.callCount;
      const evt = {
        target: {
          id: MENU_SHOW_MOUSEUP,
          checked: true
        }
      };
      browser.permissions.contains.resolves(true);
      browser.browserSettings.contextMenuShowEvent.get.resolves({
        value: 'mousedown',
        levelOfControl: 'controllable_by_this_extension'
      });
      browser.browserSettings.contextMenuShowEvent.set.resolves(false);
      const res = await func(evt);
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.get.callCount, i + 1,
        'called'
      );
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.set.callCount, j + 1,
        'called'
      );
      assert.strictEqual(window.alert.callCount, k + 1, 'called');
      assert.strictEqual(res.length, 1, 'length');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should get array', async () => {
      const i = browser.browserSettings.contextMenuShowEvent.clear.callCount;
      const evt = {
        target: {
          id: MENU_SHOW_MOUSEUP,
          checked: false
        }
      };
      browser.permissions.contains.resolves(true);
      browser.browserSettings.contextMenuShowEvent.clear.resolves(true);
      const res = await func(evt);
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.clear.callCount, i + 1,
        'called'
      );
      assert.strictEqual(res.length, 1, 'length');
      assert.deepEqual(res, [undefined], 'result');
    });
  });

  describe('add event listener to custom theme radio button', () => {
    const func = mjs.addCustomThemeListener;

    it('should not set listener', async () => {
      const elm = document.createElement('input');
      const elm2 = document.createElement('input');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      const spy2 = sinon.spy(elm2, 'addEventListener');
      elm.type = 'radio';
      elm.name = 'foo';
      elm2.type = 'radio';
      elm2.name = 'foo';
      body.appendChild(elm);
      body.appendChild(elm2);
      await func();
      assert.isTrue(spy.notCalled, 'not called');
      assert.isTrue(spy2.notCalled, 'not called');
      elm.addEventListener.restore();
      elm2.addEventListener.restore();
    });

    it('should set listener', async () => {
      const elm = document.createElement('input');
      const elm2 = document.createElement('input');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      const spy2 = sinon.spy(elm2, 'addEventListener');
      elm.type = 'radio';
      elm.name = THEME_RADIO;
      elm2.type = 'radio';
      elm2.name = THEME_RADIO;
      body.appendChild(elm);
      body.appendChild(elm2);
      await func();
      assert.isTrue(spy.called, 'not called');
      assert.isTrue(spy2.called, 'not called');
      elm.addEventListener.restore();
      elm2.addEventListener.restore();
    });
  });

  describe('toggle custom theme settings', () => {
    const func = mjs.toggleCustomThemeSettings;

    it('should remove attribute', async () => {
      const elm = document.createElement('input');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM;
      elm.type = 'radio';
      elm.checked = true;
      elm2.id = THEME_CUSTOM_SETTING;
      elm2.setAttribute('hidden', 'hidden');
      body.appendChild(elm);
      body.appendChild(elm2);
      const evt = {
        target: {
          id: elm.id,
          checked: elm.checked
        }
      };
      await func(evt);
      assert.isFalse(elm2.hasAttribute('hidden'), 'attr');
    });

    it('should add attribute', async () => {
      const elm = document.createElement('input');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM;
      elm.type = 'radio';
      elm.checked = false;
      elm2.id = THEME_CUSTOM_SETTING;
      body.appendChild(elm);
      body.appendChild(elm2);
      const evt = {
        target: {
          id: elm.id,
          checked: elm.checked
        }
      };
      await func(evt);
      assert.isTrue(elm2.hasAttribute('hidden'), 'attr');
    });
  });

  describe('set custom theme value', () => {
    const func = mjs.setCustomThemeValue;

    it('should not set value if argument not given', async () => {
      const themeId = document.createElement('input');
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      themeId.id = THEME_ID;
      elm.id = 'foo';
      elm.type = 'color';
      elm.value = '#ffffff';
      body.appendChild(themeId);
      body.appendChild(elm);
      await func();
      assert.strictEqual(themeId.value, '', 'value');
      assert.strictEqual(elm.value, '#ffffff', 'value');
    });

    it('should not set value if element not found', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'color';
      elm.value = '#ffffff';
      body.appendChild(elm);
      await func({
        id: 'foobar',
        values: {
          bar: '#1234AB'
        }
      });
      assert.strictEqual(elm.value, '#ffffff', 'value');
    });

    it('should not set value', async () => {
      const themeId = document.createElement('input');
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      themeId.id = THEME_ID;
      elm.id = 'foo';
      elm.type = 'text';
      elm.value = 'baz';
      body.appendChild(themeId);
      body.appendChild(elm);
      await func({
        values: {
          foo: '#1234AB'
        }
      });
      assert.strictEqual(themeId.value, '', 'value');
      assert.strictEqual(elm.value, 'baz', 'value');
    });

    it('should set color value', async () => {
      const themeId = document.createElement('input');
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      themeId.id = THEME_ID;
      elm.id = 'foo';
      elm.type = 'color';
      elm.value = '#ffffff';
      body.appendChild(themeId);
      body.appendChild(elm);
      await func({
        id: 'foobar',
        values: {
          foo: '#1234AB'
        }
      });
      assert.strictEqual(themeId.value, 'foobar', 'value');
      assert.strictEqual(elm.value, '#1234ab', 'value');
    });
  });

  describe('add bookmark locations', () => {
    const func = mjs.addBookmarkLocations;
    beforeEach(() => {
      const { folderMap } = mjs;
      folderMap.clear();
    });
    afterEach(() => {
      const { folderMap } = mjs;
      folderMap.clear();
    });

    it('should not call function', async () => {
      const i = browser.bookmarks.getTree.callCount;
      await func();
      assert.strictEqual(browser.bookmarks.getTree.callCount, i, 'not called');
    });

    it('should not ', async () => {
      const i = browser.bookmarks.getTree.callCount;
      const sel = document.createElement('select');
      const body = document.querySelector('body');
      body.appendChild(sel);
      await func();
      assert.strictEqual(browser.bookmarks.getTree.callCount, i, 'not called');
      assert.strictEqual(sel.childNodes.length, 0, 'node length');
    });

    it('should not add children', async () => {
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
        parentId: 'foobar',
        type: 'folder'
      }]);
      const i = browser.bookmarks.getTree.callCount;
      const sel = document.createElement('select');
      const body = document.querySelector('body');
      sel.id = BOOKMARK_LOCATION;
      body.appendChild(sel);
      await func();
      assert.strictEqual(browser.bookmarks.getTree.callCount, i + 1, 'called');
      assert.strictEqual(sel.childNodes.length, 0, 'node length');
    });

    it('should not add children', async () => {
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
      const i = browser.bookmarks.getTree.callCount;
      const sel = document.createElement('select');
      const body = document.querySelector('body');
      sel.id = BOOKMARK_LOCATION;
      body.appendChild(sel);
      await func();
      assert.strictEqual(browser.bookmarks.getTree.callCount, i + 1, 'called');
      assert.strictEqual(sel.childNodes.length, 2, 'node length');
    });
  });

  describe('add event listener to init custom theme button', () => {
    const func = mjs.addInitCustomThemeListener;

    it('should not set listener', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      body.appendChild(elm);
      await func();
      assert.isTrue(spy.notCalled, 'not called');
      elm.addEventListener.restore();
    });

    it('should set listener', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      elm.id = THEME_CUSTOM_INIT;
      body.appendChild(elm);
      await func();
      assert.isTrue(spy.calledOnce, 'called');
      elm.addEventListener.restore();
    });
  });

  describe('handle init custom theme click', () => {
    const func = mjs.handleInitCustomThemeClick;

    it('should get undefined', async () => {
      browser.runtime.sendMessage.resolves(undefined);
      const i = browser.runtime.sendMessage.callCount;
      const fake = sinon.fake();
      const fake2 = sinon.fake();
      const res = await func({
        currentTarget: 'foo',
        target: 'foo',
        preventDefault: fake,
        stopPropagation: fake2
      });
      assert.isTrue(fake.calledOnce, 'preventDefault');
      assert.isTrue(fake2.calledOnce, 'stopPropagation');
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('handle init extension click', () => {
    const func = mjs.handleInitExtClick;

    it('should get undefined', async () => {
      browser.runtime.sendMessage.resolves(undefined);
      const i = browser.runtime.sendMessage.callCount;
      const fake = sinon.fake();
      const fake2 = sinon.fake();
      const res = await func({
        currentTarget: 'foo',
        target: 'foo',
        preventDefault: fake,
        stopPropagation: fake2
      });
      assert.isTrue(fake.calledOnce, 'preventDefault');
      assert.isTrue(fake2.calledOnce, 'stopPropagation');
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('add event listener to init button', () => {
    const func = mjs.addInitExtensionListener;

    it('should not set listener', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      body.appendChild(elm);
      await func();
      assert.isTrue(spy.notCalled, 'not called');
      elm.addEventListener.restore();
    });

    it('should set listener', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      elm.id = EXT_INIT;
      body.appendChild(elm);
      await func();
      assert.isTrue(spy.calledOnce, 'called');
      elm.addEventListener.restore();
    });
  });

  describe('save user CSS', () => {
    const func = mjs.saveUserCss;

    it('should not call function', async () => {
      const i = browser.storage.local.set.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('textarea');
      const body = document.querySelector('body');
      elm.id = USER_CSS;
      body.appendChild(elm);
      const res = await func();
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('textarea');
      const elm2 = document.createElement('span');
      const body = document.querySelector('body');
      elm.id = USER_CSS;
      elm2.id = USER_CSS_WARN;
      elm2.hidden = true;
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func();
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isTrue(elm2.hidden);
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should not call function', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('textarea');
      const elm2 = document.createElement('span');
      const body = document.querySelector('body');
      elm.id = USER_CSS;
      elm.value = 'foo';
      elm2.id = USER_CSS_WARN;
      elm2.hidden = true;
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func();
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isFalse(elm2.hidden, 'hidden');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('textarea');
      const elm2 = document.createElement('span');
      const body = document.querySelector('body');
      elm.id = USER_CSS;
      elm.value = 'body { color: red; }';
      elm2.id = USER_CSS_WARN;
      elm2.hidden = true;
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func();
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isTrue(elm2.hidden);
      assert.deepEqual(res, [undefined], 'result');
    });
  });

  describe('add event listener to save user CSS', () => {
    const func = mjs.addUserCssListener;

    it('should not set listener', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      body.appendChild(elm);
      await func();
      assert.isTrue(spy.notCalled, 'not called');
      elm.addEventListener.restore();
    });

    it('should set listener', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      elm.id = USER_CSS_SAVE;
      body.appendChild(elm);
      await func();
      assert.isTrue(spy.calledOnce, 'called');
      elm.addEventListener.restore();
    });
  });

  describe('toggle sub items', () => {
    const func = mjs.toggleSubItems;

    it('should throw', () => {
      assert.throws(() => func());
    });

    it('should not remove attribute', async () => {
      const elm = document.createElement('span');
      const elm2 = document.createElement('span');
      const elm3 = document.createElement('span');
      const elm4 = document.createElement('span');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm2.dataset.subItemOf = 'foo';
      elm3.dataset.subItemOf = 'foo';
      elm4.dataset.subItemOf = 'bar';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      await func({
        target: elm
      });
      assert.isTrue(elm2.hasAttribute('disabled'), 'set attr');
      assert.isTrue(elm3.hasAttribute('disabled'), 'set attr');
      assert.isFalse(elm4.hasAttribute('disabled'), 'set attr');
    });

    it('should remove attribute', async () => {
      const elm = document.createElement('span');
      const elm2 = document.createElement('span');
      const elm3 = document.createElement('span');
      const elm4 = document.createElement('span');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.checked = true;
      elm2.setAttribute('disabled', 'disabled');
      elm2.dataset.subItemOf = 'foo';
      elm3.setAttribute('disabled', 'disabled');
      elm3.dataset.subItemOf = 'foo';
      elm4.setAttribute('disabled', 'disabled');
      elm4.dataset.subItemOf = 'bar';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      await func({
        target: elm
      });
      assert.isFalse(elm2.hasAttribute('disabled'), 'set attr');
      assert.isFalse(elm3.hasAttribute('disabled'), 'set attr');
      assert.isTrue(elm4.hasAttribute('disabled'), 'set attr');
    });
  });

  describe('handle input change', () => {
    const func = mjs.handleInputChange;

    it('should call function', async () => {
      const i = browser.storage.local.set.callCount;
      const evt = {
        target: {
          id: 'foo',
          type: 'text'
        }
      };
      const res = await func(evt);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.strictEqual(res.length, 1, 'array length');
      assert.deepEqual(res, [undefined], 'result');
    });
  });

  describe('add event listener to input elements', () => {
    const func = mjs.addInputChangeListener;

    it('should add listener', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      body.appendChild(elm);
      await func();
      assert.isTrue(spy.calledOnce, 'called');
      elm.addEventListener.restore();
    });

    it('should add listener', async () => {
      const elm = document.createElement('input');
      const sub = document.createElement('input');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      elm.id = USER_CSS_USE;
      sub.dataset.subItemOf = USER_CSS_USE;
      body.appendChild(elm);
      body.appendChild(sub);
      await func();
      assert.isTrue(spy.calledTwice, 'called');
      assert.isTrue(sub.hasAttribute('disabled'), 'sub');
      elm.addEventListener.restore();
    });
  });

  describe('set html input value', () => {
    const func = mjs.setHtmlInputValue;

    it('should not set value if argument not given', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'checkbox';
      body.appendChild(elm);
      const res = await func();
      assert.strictEqual(elm.checked, false, 'checked');
      assert.deepEqual(res, [], 'result');
    });

    it('should not set value if element not found', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'checkbox';
      body.appendChild(elm);
      const res = await func({
        id: 'bar',
        checked: true
      });
      assert.strictEqual(elm.checked, false, 'checked');
      assert.deepEqual(res, [], 'result');
    });

    it('should not set value if type does not match', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'search';
      elm.checked = false;
      elm.value = 'baz';
      body.appendChild(elm);
      const res = await func({
        id: 'foo',
        checked: true,
        value: 'qux'
      });
      assert.strictEqual(elm.checked, false, 'checked');
      assert.strictEqual(elm.value, 'baz', 'checked');
      assert.deepEqual(res, [], 'result');
    });

    it('should set checkbox value', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'checkbox';
      body.appendChild(elm);
      const res = await func({
        id: 'foo',
        checked: true
      });
      assert.strictEqual(elm.checked, true, 'checked');
      assert.deepEqual(res, [], 'result');
    });

    it('should set checkbox value', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'checkbox';
      body.appendChild(elm);
      const res = await func({
        id: 'foo'
      });
      assert.strictEqual(elm.checked, false, 'checked');
      assert.deepEqual(res, [], 'result');
    });

    it('should set checkbox value', async () => {
      const elm = document.createElement('input');
      const elm2 = document.createElement('span');
      const elm3 = document.createElement('span');
      const elm4 = document.createElement('span');
      const body = document.querySelector('body');
      elm.type = 'checkbox';
      elm.id = USER_CSS_USE;
      elm.checked = true;
      elm2.setAttribute('disabled', 'disabled');
      elm2.dataset.subItemOf = USER_CSS_USE;
      elm3.setAttribute('disabled', 'disabled');
      elm3.dataset.subItemOf = USER_CSS_USE;
      elm4.setAttribute('disabled', 'disabled');
      elm4.dataset.subItemOf = 'foo';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func({
        id: USER_CSS_USE,
        checked: true
      });
      assert.strictEqual(elm.checked, true, 'checked');
      assert.isFalse(elm2.hasAttribute('disabled'), 'set attr');
      assert.isFalse(elm3.hasAttribute('disabled'), 'set attr');
      assert.isTrue(elm4.hasAttribute('disabled'), 'set attr');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set radio value', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'radio';
      body.appendChild(elm);
      const res = await func({
        id: 'foo',
        checked: true
      });
      assert.strictEqual(elm.checked, true, 'checked');
      assert.deepEqual(res, [], 'result');
    });

    it('should set radio value', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM;
      elm.type = 'radio';
      body.appendChild(elm);
      const res = await func({
        id: THEME_CUSTOM,
        checked: true
      });
      assert.strictEqual(elm.checked, true, 'checked');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set text value', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'text';
      body.appendChild(elm);
      const res = await func({
        id: 'foo',
        value: 'bar'
      });
      assert.strictEqual(elm.value, 'bar', 'value');
      assert.deepEqual(res, [], 'result');
    });

    it('should set text value', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'text';
      body.appendChild(elm);
      const res = await func({
        id: 'foo'
      });
      assert.strictEqual(elm.value, '', 'value');
      assert.deepEqual(res, [], 'result');
    });

    it('should set url value', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'url';
      body.appendChild(elm);
      const res = await func({
        id: 'foo',
        value: 'bar/baz'
      });
      assert.strictEqual(elm.value, 'bar/baz', 'value');
      assert.deepEqual(res, [], 'result');
    });

    it('should set color value', async () => {
      const elm = document.createElement('input');
      const body = document.querySelector('body');
      elm.id = 'foo';
      elm.type = 'color';
      body.appendChild(elm);
      const res = await func({
        id: 'foo',
        value: '#ffffff'
      });
      assert.strictEqual(elm.value, '#ffffff', 'value');
      assert.deepEqual(res, [], 'result');
    });

    it('should not set option attribute', async () => {
      const elm = document.createElement('select');
      const child = document.createElement('option');
      const child2 = document.createElement('option');
      const child3 = document.createElement('option');
      const body = document.querySelector('body');
      elm.id = BOOKMARK_LOCATION;
      child.id = 'foo';
      child2.id = 'bar';
      child3.id = 'baz';
      elm.appendChild(child);
      elm.appendChild(child2);
      elm.appendChild(child3);
      body.appendChild(elm);
      const res = await func({
        id: BOOKMARK_LOCATION,
        value: 'qux'
      });
      assert.isFalse(child.hasAttribute('selected'), 'attr');
      assert.isFalse(child2.hasAttribute('selected'), 'attr');
      assert.isFalse(child3.hasAttribute('selected'), 'attr');
      assert.deepEqual(res, [], 'result');
    });

    it('should set option attribute', async () => {
      const elm = document.createElement('select');
      const child = document.createElement('option');
      const child2 = document.createElement('option');
      const child3 = document.createElement('option');
      const body = document.querySelector('body');
      elm.id = BOOKMARK_LOCATION;
      child.id = 'foo';
      child2.id = 'bar';
      child3.id = 'baz';
      elm.appendChild(child);
      elm.appendChild(child2);
      elm.appendChild(child3);
      body.appendChild(elm);
      const res = await func({
        id: BOOKMARK_LOCATION,
        value: 'bar'
      });
      assert.isFalse(child.hasAttribute('selected'), 'attr');
      assert.isTrue(child2.hasAttribute('selected'), 'attr');
      assert.isFalse(child3.hasAttribute('selected'), 'attr');
      assert.deepEqual(res, [], 'result');
    });

    it('should set value attribute', async () => {
      const elm = document.createElement('textarea');
      const body = document.querySelector('body');
      elm.id = USER_CSS;
      body.appendChild(elm);
      const res = await func({
        id: USER_CSS
      });
      assert.strictEqual(elm.value, '', 'value');
      assert.deepEqual(res, [], 'result');
    });

    it('should set value attribute', async () => {
      const elm = document.createElement('textarea');
      const body = document.querySelector('body');
      elm.id = USER_CSS;
      body.appendChild(elm);
      const res = await func({
        id: USER_CSS,
        value: 'body: { color: red; }'
      });
      assert.strictEqual(elm.value, 'body: { color: red; }', 'value');
      assert.deepEqual(res, [], 'result');
    });
  });

  describe('set html input values from storage', () => {
    const func = mjs.setValuesFromStorage;

    it('should get empty array', async () => {
      const i = browser.storage.local.get.callCount;
      browser.storage.local.get.resolves({});
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(res.length, 0, 'array length');
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', async () => {
      const i = browser.storage.local.get.callCount;
      browser.storage.local.get.resolves({
        foo: {},
        bar: {}
      });
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(res.length, 0, 'array length');
      assert.deepEqual(res, [], 'result');
    });

    it('should get array', async () => {
      const i = browser.storage.local.get.callCount;
      browser.storage.local.get.resolves({
        foo: {
          bar: {}
        },
        baz: {
          qux: {}
        }
      });
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(res.length, 2, 'array length');
      assert.deepEqual(res, [[], []], 'result');
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
      const msg = {
        [THEME_CUSTOM_SETTING]: false
      };
      const res = await func(msg);
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const msg = {
        [THEME_CUSTOM_SETTING]: {}
      };
      const res = await func(msg);
      assert.deepEqual(res, [undefined], 'result');
    });
  });
});
