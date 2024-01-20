/**
 * tab-content.test.js
 */
/* eslint-disable import/order */

/* api */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sinon from 'sinon';
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';

/* test */
import * as mjs from '../src/mjs/tab-content.js';
import {
  CLASS_MULTI, CLASS_TAB_AUDIO, CLASS_TAB_CLOSE, CLASS_TAB_CONTENT,
  CLASS_TAB_ICON, CLASS_TAB_TITLE,
  HIGHLIGHTED, IDENTIFIED, TAB_CLOSE, TAB_MUTE, TAB_MUTE_UNMUTE, TABS_CLOSE,
  TABS_MUTE, TABS_MUTE_UNMUTE,
  URL_AUDIO_MUTED, URL_AUDIO_PLAYING, URL_FAVICON_DEFAULT, URL_LOADING_THROBBER,
  URL_SPACER
} from '../src/mjs/constant.js';

describe('tab-content', () => {
  const globalKeys = ['DOMParser', 'Node', 'XMLSerializer'];
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

  describe('icon', () => {
    it('should exist', async () => {
      const items = [
        URL_AUDIO_MUTED, URL_AUDIO_PLAYING, URL_FAVICON_DEFAULT,
        URL_LOADING_THROBBER
      ];
      for (const item of items) {
        const file = path.resolve(path.join(process.cwd(), 'src', 'mjs', item));
        assert.isTrue(fs.existsSync(file), `exist ${item}`);
      }
    });

    it('should exist', async () => {
      const { favicon } = mjs;
      const itemKeys = [
        'https://abs.twimg.com/favicons/favicon.ico',
        'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
        'chrome://browser/skin/customize.svg',
        'chrome://browser/skin/settings.svg',
        'chrome://mozapps/skin/extensions/extensionGeneric-16.svg',
        'chrome://mozapps/skin/extensions/extension.svg'
      ];
      assert.strictEqual(favicon.size, itemKeys.length, 'size');
      favicon.forEach((value, key) => {
        const file =
          path.resolve(path.join(process.cwd(), 'src', 'mjs', value));
        assert.isTrue(fs.existsSync(file), `exist ${file}`);
        assert.isTrue(itemKeys.includes(key), 'key');
      });
    });

    it('should exist', async () => {
      const { contextualIdentitiesIconName: iconName } = mjs;
      const itemKeys = [
        'briefcase', 'cart', 'chill', 'dollar', 'fence', 'fingerprint', 'food',
        'fruit', 'gift', 'pet', 'tree', 'vacation'
      ];
      assert.strictEqual(iconName.size, itemKeys.length, 'size');
      iconName.forEach(value => {
        const file =
          path.resolve(path.join(process.cwd(), 'src', 'img', `${value}.svg`));
        assert.isTrue(fs.existsSync(file), `exist ${value}`);
      });
    });
  });

  describe('tab icon fallback', () => {
    const func = mjs.tabIconFallback;

    it('should not set fallback icon if no argument given', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func();
      assert.strictEqual(elm.src, '', 'src');
      assert.isFalse(res, 'result');
    });

    it('should not set fallback icon if argument is empty object', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func({});
      assert.strictEqual(elm.src, '', 'src');
      assert.isFalse(res, 'result');
    });

    it('should not set fallback icon if type is not error', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func({
        target: elm,
        type: 'foo'
      });
      assert.strictEqual(elm.src, '', 'src');
      assert.isFalse(res, 'result');
    });

    it('should not set fallback icon if target is not img', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func({
        target: elm,
        type: 'error'
      });
      assert.isUndefined(elm.src, 'src');
      assert.isFalse(res, 'result');
    });

    it('should set fallback icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func({
        target: elm,
        type: 'error'
      });
      assert.strictEqual(elm.src, URL_FAVICON_DEFAULT, 'src');
      assert.isFalse(res, 'result');
    });

    it('should set fallback icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.src = 'https://example.com/favicon.ico';
      body.appendChild(elm);
      const res = await func({
        target: elm,
        type: 'error'
      });
      assert.strictEqual(elm.src, URL_FAVICON_DEFAULT, 'src');
      assert.isFalse(res, 'result');
    });

    it('should set fallback icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.src = 'chrome://foo.svg';
      body.appendChild(elm);
      const res = await func({
        target: elm,
        type: 'error'
      });
      assert.strictEqual(elm.src, URL_FAVICON_DEFAULT, 'src');
      assert.isFalse(res, 'result');
    });
  });

  describe('add tab icon error listener', () => {
    const func = mjs.addTabIconErrorListener;

    it('should not add listener if element is not img', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      body.appendChild(elm);
      await func(elm);
      assert.isFalse(spy.calledOnce, 'not called');
      elm.addEventListener.restore();
    });

    it('should add listener', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      body.appendChild(elm);
      await func(elm);
      assert.isTrue(spy.calledOnce, 'called');
      elm.addEventListener.restore();
    });
  });

  describe('set tab icon', () => {
    const func = mjs.setTabIcon;

    it('should not set icon if element is not img', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm, {
        foo: 'bar'
      });
      assert.strictEqual(elm.style.fill, 'red', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
    });

    it('should not set icon if 2nd argument is not given', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm);
      assert.strictEqual(elm.style.fill, 'red', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
    });

    it('should not set icon if 2nd argument is empty object', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm, {});
      assert.strictEqual(elm.style.fill, 'red', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
    });

    it('should set default icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm, {
        foo: 'bar'
      });
      assert.strictEqual(elm.style.fill, '', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, '', 'connecting');
      assert.strictEqual(elm.src, URL_FAVICON_DEFAULT, 'src');
    });

    it('should set default icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm, {
        status: 'complete'
      });
      assert.strictEqual(elm.style.fill, '', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, '', 'connecting');
      assert.strictEqual(elm.src, URL_FAVICON_DEFAULT, 'src');
    });

    it('should set icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm, {
        status: 'complete',
        url: 'https://example.com',
        favIconUrl: 'https://example.com/favicon.ico'
      });
      assert.strictEqual(elm.style.fill, '', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, '', 'connecting');
      assert.strictEqual(elm.src, 'https://example.com/favicon.ico', 'src');
    });

    it('should set icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm, {
        status: 'complete',
        url: 'https://example.com',
        favIconUrl: 'https://abs.twimg.com/favicons/favicon.ico'
      });
      assert.strictEqual(elm.style.fill, '', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, '', 'connecting');
      assert.strictEqual(elm.src, '../img/twitter-logo-blue.svg', 'src');
    });

    it('should set throbber icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm, {
        status: 'loading'
      });
      assert.strictEqual(elm.style.fill, 'red', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, '', 'connecting');
      assert.strictEqual(elm.src, URL_LOADING_THROBBER, 'src');
    });

    it('should set throbber icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm, {
        status: 'loading',
        url: 'foo/bar'
      });
      assert.strictEqual(elm.style.fill, 'red', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, '', 'connecting');
      assert.strictEqual(elm.src, URL_LOADING_THROBBER, 'src');
    });

    it('should set throbber icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm, {
        status: 'loading',
        url: 'foo/bar',
        title: 'baz'
      });
      assert.strictEqual(elm.style.fill, 'red', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, '', 'connecting');
      assert.strictEqual(elm.src, URL_LOADING_THROBBER, 'src');
    });

    it('should set throbber icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      body.appendChild(elm);
      await func(elm, {
        status: 'loading',
        url: 'https://example.com',
        title: 'example.com/'
      });
      assert.strictEqual(elm.style.fill, 'red', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, 'https://example.com/',
        'connecting');
      assert.strictEqual(elm.src, URL_LOADING_THROBBER, 'src');
    });

    it('should set throbber icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      elm.dataset.connecting = 'https://example.com/';
      body.appendChild(elm);
      await func(elm, {
        status: 'loading',
        url: 'https://example.com',
        title: 'example.com/'
      });
      assert.strictEqual(elm.style.fill, 'red', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, 'https://example.com/',
        'connecting');
      assert.strictEqual(elm.src, URL_LOADING_THROBBER, 'src');
    });

    it('should set throbber icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'red';
      elm.style.stroke = 'blue';
      elm.dataset.connecting = 'https://example.com';
      body.appendChild(elm);
      await func(elm, {
        status: 'loading',
        url: 'https://example.com',
        title: 'Example Domain'
      });
      assert.strictEqual(elm.style.fill, 'blue', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, '', 'connecting');
      assert.strictEqual(elm.src, URL_LOADING_THROBBER, 'src');
    });

    it('should set throbber icon', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.style.fill = 'blue';
      elm.style.stroke = 'blue';
      elm.dataset.connecting = '';
      body.appendChild(elm);
      await func(elm, {
        status: 'loading',
        url: 'https://example.com',
        title: 'Example Domain'
      });
      assert.strictEqual(elm.style.fill, 'blue', 'fill');
      assert.strictEqual(elm.style.stroke, 'blue', 'stroke');
      assert.strictEqual(elm.dataset.connecting, '', 'connecting');
      assert.strictEqual(elm.src, URL_LOADING_THROBBER, 'src');
    });
  });

  describe('set tab content', () => {
    const func = mjs.setTabContent;

    it('should not set content if 2nd argument is not given', async () => {
      const elm = document.createElement('p');
      const elm2 = document.createElement('span');
      const elm3 = document.createElement('span');
      const elm4 = document.createElement('img');
      const body = document.querySelector('body');
      elm2.classList.add(CLASS_TAB_CONTENT);
      elm3.classList.add(CLASS_TAB_TITLE);
      elm4.classList.add(CLASS_TAB_ICON);
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      elm.appendChild(elm4);
      body.appendChild(elm);
      await func(elm);
      assert.strictEqual(elm2.title, '', 'title');
      assert.strictEqual(elm3.textContent, '', 'text');
      assert.strictEqual(elm4.src, '', 'src');
    });

    it('should set content', async () => {
      const elm = document.createElement('p');
      const elm2 = document.createElement('span');
      const elm3 = document.createElement('span');
      const elm4 = document.createElement('img');
      const body = document.querySelector('body');
      const opt = {
        status: 'complete',
        title: 'foo',
        url: 'https://example.com'
      };
      elm2.classList.add(CLASS_TAB_CONTENT);
      elm3.classList.add(CLASS_TAB_TITLE);
      elm4.classList.add(CLASS_TAB_ICON);
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      elm.appendChild(elm4);
      body.appendChild(elm);
      await func(elm, opt);
      assert.strictEqual(elm2.title, 'foo', 'title');
      assert.strictEqual(elm3.textContent, 'foo', 'text');
      assert.strictEqual(elm4.src, URL_FAVICON_DEFAULT, 'src');
      assert.deepEqual(JSON.parse(elm.dataset.tab), opt, 'json');
    });
  });

  describe('handle clicked audio button', () => {
    const func = mjs.handleClickedTabAudio;

    it('should get null', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm);
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const parent = document.createElement('p');
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: true
        }
      });
      browser.tabs.update.withArgs(1, {
        muted: false
      }).resolves(true);
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const parent = document.createElement('p');
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      parent.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 1, 'called update');
      assert.isTrue(res, 'result');
    });

    it('should get result', async () => {
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: true
        }
      });
      browser.tabs.update.withArgs(1, {
        muted: false
      }).resolves(true);
      browser.tabs.update.withArgs(2, {
        muted: false
      }).resolves(true);
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const parent = document.createElement('p');
      const parent2 = document.createElement('p');
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      parent.dataset.tabId = '1';
      parent.classList.add(HIGHLIGHTED);
      parent.appendChild(elm);
      parent2.dataset.tabId = '2';
      parent2.classList.add(HIGHLIGHTED);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 2, 'called update');
      assert.deepEqual(res, [true, true], 'result');
    });
  });

  describe('handle tab audio onclick', () => {
    const func = mjs.tabAudioOnClick;

    it('should get null', async () => {
      const res = await func({
        foo: 'bar'
      });
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        target: elm
      };
      const res = await func(evt);
      assert.isFalse(preventDefault.called, 'event not prevented');
      assert.isFalse(stopPropagation.called, 'event not stopped');
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const parent = document.createElement('p');
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        target: elm
      };
      const res = await func(evt);
      assert.isFalse(preventDefault.called, 'event not prevented');
      assert.isFalse(stopPropagation.called, 'event not stopped');
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: true
        }
      });
      browser.tabs.update.withArgs(1, {
        muted: false
      }).resolves(true);
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const parent = document.createElement('p');
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      parent.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        target: elm
      };
      const res = await func(evt);
      assert.isTrue(preventDefault.calledOnce, 'event prevented');
      assert.isTrue(stopPropagation.calledOnce, 'event stopped');
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 1, 'called update');
      assert.isTrue(res, 'result');
    });

    it('should get result', async () => {
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: true
        }
      });
      browser.tabs.update.withArgs(1, {
        muted: false
      }).resolves(true);
      browser.tabs.update.withArgs(2, {
        muted: false
      }).resolves(true);
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const parent = document.createElement('p');
      const parent2 = document.createElement('p');
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      parent.dataset.tabId = '1';
      parent.classList.add(HIGHLIGHTED);
      parent.appendChild(elm);
      parent2.dataset.tabId = '2';
      parent2.classList.add(HIGHLIGHTED);
      body.appendChild(parent);
      body.appendChild(parent2);
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        target: elm
      };
      const res = await func(evt);
      assert.isTrue(preventDefault.calledOnce, 'event prevented');
      assert.isTrue(stopPropagation.calledOnce, 'event stopped');
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 2, 'called update');
      assert.deepEqual(res, [true, true], 'result');
    });
  });

  describe('add tab audio click event listener', () => {
    const func = mjs.addTabAudioClickListener;

    it('should not add listener', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      body.appendChild(elm);
      await func(elm);
      assert.isFalse(spy.calledOnce, 'called');
      elm.addEventListener.restore();
    });

    it('should add listener', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      elm.classList.add(CLASS_TAB_AUDIO);
      body.appendChild(elm);
      await func(elm);
      assert.isTrue(spy.calledOnce, 'called');
      elm.addEventListener.restore();
    });
  });

  describe('set tab audio', () => {
    const func = mjs.setTabAudio;
    beforeEach(() => {
      browser.i18n.getMessage.withArgs(`${TAB_MUTE_UNMUTE}_tooltip`)
        .returns('bar');
      browser.i18n.getMessage.withArgs(`${TAB_MUTE}_tooltip`).returns('qux');
    });

    it('should not set title if 2nd argument is empty object', async () => {
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.title = 'foobar';
      body.appendChild(elm);
      await func(elm, {});
      assert.strictEqual(browser.i18n.getMessage.callCount, i, 'not called');
      assert.strictEqual(elm.title, 'foobar', 'title');
    });

    it('should set default unmute title', async () => {
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.title = 'foobar';
      body.appendChild(elm);
      await func(elm, {
        audible: false,
        muted: true,
        highlighted: true
      });
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 1, 'called');
      assert.strictEqual(elm.title, 'bar', 'title');
    });

    it('should set unmute title', async () => {
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.title = 'foobar';
      body.appendChild(elm);
      browser.i18n.getMessage.withArgs(`${TABS_MUTE_UNMUTE}_tooltip`, '2')
        .returns('foo');
      await func(elm, {
        audible: false,
        muted: true,
        highlighted: true
      }, 2);
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 1, 'called');
      assert.strictEqual(elm.title, 'foo', 'title');
    });

    it('should set default unmute title', async () => {
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.title = 'foobar';
      body.appendChild(elm);
      await func(elm, {
        audible: false,
        muted: true,
        highlighted: false
      });
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 1, 'called');
      assert.strictEqual(elm.title, 'bar', 'title');
    });

    it('should set default mute title', async () => {
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.title = 'foobar';
      body.appendChild(elm);
      await func(elm, {
        audible: true,
        muted: false,
        highlighted: true
      });
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 1, 'called');
      assert.strictEqual(elm.title, 'qux', 'title');
    });

    it('should set mute title', async () => {
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.title = 'foobar';
      body.appendChild(elm);
      browser.i18n.getMessage.withArgs(`${TABS_MUTE}_tooltip`, '2')
        .returns('baz');
      await func(elm, {
        audible: true,
        muted: false,
        highlighted: true
      }, 2);
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 1, 'called');
      assert.strictEqual(elm.title, 'baz', 'title');
    });

    it('should set default mute title', async () => {
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.title = 'foobar';
      body.appendChild(elm);
      await func(elm, {
        audible: true,
        muted: false,
        highlighted: false
      });
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 1, 'called');
      assert.strictEqual(elm.title, 'qux', 'title');
    });

    it('should set empty title', async () => {
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.title = 'foobar';
      body.appendChild(elm);
      await func(elm, {
        audible: false,
        muted: false
      });
      assert.strictEqual(browser.i18n.getMessage.callCount, i, 'not called');
      assert.strictEqual(elm.title, '', 'title');
    });
  });

  describe('set tab audio icon', () => {
    const func = mjs.setTabAudioIcon;

    it('should not set icon if element is not img', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      await func(elm, {
        foo: 'bar'
      });
      assert.isUndefined(elm.alt, 'alt');
      assert.isUndefined(elm.src, 'src');
    });

    it('should not set icon if 2nd argument is empty object', async () => {
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.alt = 'foo';
      elm.src = 'https://example.com/favicon.ico';
      body.appendChild(elm);
      await func(elm, {});
      assert.strictEqual(elm.alt, 'foo', 'alt');
      assert.strictEqual(elm.src, 'https://example.com/favicon.ico', 'src');
    });

    it('should set icon', async () => {
      browser.i18n.getMessage.withArgs(`${TAB_MUTE_UNMUTE}`).returns('foo');
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      body.appendChild(elm);
      await func(elm, {
        muted: true
      });
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 1, 'called');
      assert.strictEqual(elm.alt, 'foo', 'alt');
      assert.strictEqual(elm.src, URL_AUDIO_MUTED, 'src');
    });

    it('should set icon', async () => {
      browser.i18n.getMessage.withArgs(`${TAB_MUTE}`).returns('foo');
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      body.appendChild(elm);
      await func(elm, {
        audible: true
      });
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 1, 'called');
      assert.strictEqual(elm.alt, 'foo', 'alt');
      assert.strictEqual(elm.src, URL_AUDIO_PLAYING, 'src');
    });

    it('should set spacer icon', async () => {
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      elm.alt = 'foo';
      elm.src = 'https://example.com/favicon.ico';
      body.appendChild(elm);
      await func(elm, {
        muted: false,
        audible: false
      });
      assert.strictEqual(browser.i18n.getMessage.callCount, i, 'not called');
      assert.strictEqual(elm.alt, '', 'alt');
      assert.strictEqual(elm.src, URL_SPACER, 'src');
    });
  });

  describe('set close tab button tooltip', () => {
    const func = mjs.setCloseTab;
    beforeEach(() => {
      browser.i18n.getMessage.withArgs(`${TAB_CLOSE}_tooltip`).returns('bar');
    });

    it('should not set tooltip', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      await func(elm);
      assert.strictEqual(elm.title, '', 'tooltip');
    });

    it('should set tooltip', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_CLOSE);
      body.appendChild(elm);
      browser.i18n.getMessage.withArgs(`${TABS_CLOSE}_tooltip`, '2')
        .returns('foo');
      await func(elm, true, 2);
      assert.strictEqual(elm.title, 'foo', 'tooltip');
    });

    it('should set default tooltip', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_CLOSE);
      body.appendChild(elm);
      await func(elm, true, 1);
      assert.strictEqual(elm.title, 'bar', 'tooltip');
    });

    it('should set default tooltip', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_CLOSE);
      body.appendChild(elm);
      await func(elm, false);
      assert.strictEqual(elm.title, 'bar', 'tooltip');
    });
  });

  describe('handle tab close button click', () => {
    const func = mjs.tabCloseOnClick;

    it('should get null', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        target: elm
      };
      const res = await func(evt);
      assert.isFalse(preventDefault.called, 'event not prevented');
      assert.isFalse(stopPropagation.called, 'event not stopped');
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      browser.tabs.remove.withArgs([1]).resolves(undefined);
      const i = browser.tabs.remove.callCount;
      const parent = document.createElement('p');
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      parent.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        target: elm
      };
      const res = await func(evt);
      assert.isTrue(preventDefault.calledOnce, 'event prevented');
      assert.isTrue(stopPropagation.calledOnce, 'event stopped');
      assert.strictEqual(browser.tabs.remove.callCount, i + 1, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should get result', async () => {
      browser.tabs.remove.withArgs([1]).resolves(undefined);
      const i = browser.tabs.remove.callCount;
      const parent = document.createElement('p');
      const parent2 = document.createElement('p');
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      parent.dataset.tabId = '1';
      parent.classList.add(HIGHLIGHTED);
      parent.appendChild(elm);
      body.appendChild(parent);
      body.appendChild(parent2);
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        target: elm
      };
      const res = await func(evt);
      assert.isTrue(preventDefault.calledOnce, 'event prevented');
      assert.isTrue(stopPropagation.calledOnce, 'event stopped');
      assert.strictEqual(browser.tabs.remove.callCount, i + 1, 'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('prevent default event behavior', () => {
    const func = mjs.preventDefaultEvent;

    it('should call function', () => {
      const stub = sinon.stub();
      const evt = {
        preventDefault: stub
      };
      func(evt);
      assert.isTrue(stub.calledOnce);
    });
  });

  describe('add tab close click listener', () => {
    const func = mjs.addTabCloseClickListener;

    it('should not add listener', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      body.appendChild(elm);
      await func(elm);
      assert.isFalse(spy.called, 'not called');
      elm.addEventListener.restore();
    });

    it('should add listener', async () => {
      const elm = document.createElement('button');
      const body = document.querySelector('body');
      const spy = sinon.spy(elm, 'addEventListener');
      elm.classList.add(CLASS_TAB_CLOSE);
      body.appendChild(elm);
      await func(elm);
      assert.isTrue(spy.calledTwice, 'called');
      elm.addEventListener.restore();
    });
  });

  describe('contextual identities icon color', () => {
    it('should have keys', () => {
      const { contextualIdentitiesIconColor: iconColor } = mjs;
      const itemKeys = [
        'blue', 'purple', 'pink', 'red', 'orange', 'yellow', 'green',
        'turquoise'
      ];
      assert.strictEqual(iconColor.size, itemKeys.length, 'size');
      for (const key of itemKeys) {
        assert.isTrue(iconColor.has(key), `key ${key}`);
      }
    });
  });

  describe('set contextual identities icon', () => {
    const func = mjs.setContextualIdentitiesIcon;

    it('should not set icon if element is not img', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm);
      assert.isUndefined(elm.alt, 'alt');
      assert.isUndefined(elm.src, 'src');
      assert.isFalse(parent.classList.contains(IDENTIFIED), 'class');
    });

    it('should not set icon if 2nd argument is empty object', async () => {
      const parent = document.createElement('p');
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm, {});
      assert.strictEqual(elm.alt, '', 'alt');
      assert.strictEqual(elm.src, '', 'src');
      assert.isFalse(parent.classList.contains(IDENTIFIED), 'class');
    });

    it('should not set icon if icon does not match', async () => {
      const parent = document.createElement('p');
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm, {
        color: 'foo',
        icon: 'bar',
        name: 'baz'
      });
      assert.strictEqual(elm.alt, '', 'alt');
      assert.strictEqual(elm.src, '', 'src');
      assert.isFalse(parent.classList.contains(IDENTIFIED), 'class');
    });

    it('should not set icon if name is not a string', async () => {
      const parent = document.createElement('p');
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm, {
        color: 'blue',
        icon: 'briefcase',
        name: 1
      });
      assert.strictEqual(elm.alt, '', 'alt');
      assert.strictEqual(elm.src, '', 'src');
      assert.isFalse(parent.classList.contains(IDENTIFIED), 'class');
    });

    it('should not set icon if icon and/or name lacks', async () => {
      const parent = document.createElement('p');
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm, {
        color: 'blue',
        icon: 'briefcase'
      });
      assert.strictEqual(elm.alt, '', 'alt');
      assert.strictEqual(elm.src, '', 'src');
      assert.isFalse(parent.classList.contains(IDENTIFIED), 'class');
    });

    it('should not set icon if icon and/or name lacks', async () => {
      const parent = document.createElement('p');
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm, {
        color: 'blue',
        name: 'foo'
      });
      assert.strictEqual(elm.alt, '', 'alt');
      assert.strictEqual(elm.src, '', 'src');
      assert.isFalse(parent.classList.contains(IDENTIFIED), 'class');
    });

    it('should set icon', async () => {
      const parent = document.createElement('p');
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm, {
        color: 'blue',
        icon: 'briefcase',
        name: 'foo'
      });
      assert.strictEqual(elm.alt, 'foo', 'alt');
      assert.strictEqual(elm.src, '../img/briefcase.svg#blue', 'src');
      assert.isTrue(parent.classList.contains(IDENTIFIED), 'class');
    });

    it('should set icon', async () => {
      const parent = document.createElement('p');
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm, {
        color: 'bar',
        icon: 'briefcase',
        name: 'foo'
      });
      assert.strictEqual(elm.alt, 'foo', 'alt');
      assert.strictEqual(elm.src, '../img/briefcase.svg#current', 'src');
      assert.isTrue(parent.classList.contains(IDENTIFIED), 'class');
    });

    it('should set icon', async () => {
      const stubFetch = sinon.stub(globalThis, 'fetch').resolves({
        text: async () => {
          const str = '<svg><g id="current"/></svg>';
          return str;
        }
      })
      const parent = document.createElement('p');
      const elm = document.createElement('img');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm, {
        color: 'bar',
        colorCode: 'gray',
        icon: 'briefcase',
        name: 'foo'
      });
      stubFetch.restore();
      assert.strictEqual(elm.alt, 'foo', 'alt');
      assert.isTrue(elm.src.startsWith('data:'), 'src');
      assert.isTrue(parent.classList.contains(IDENTIFIED), 'class');
    });
  });

  describe('add hightlight class to tab', () => {
    const func = mjs.addHighlight;

    it('should not add class if argument not given', async () => {
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should not add class if argument is not element', async () => {
      const res = await func('foo');
      assert.deepEqual(res, [], 'result');
    });

    it('should not add class if argument is not tab', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm);
      assert.deepEqual(res, [], 'result');
    });

    it('should add class', async () => {
      browser.tabs.get.withArgs(1).resolves({
        audible: true,
        mutedInfo: {
          muted: false
        }
      });
      const i = browser.tabs.get.withArgs(1).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('img');
      const elm3 = document.createElement('button');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.withArgs(1).callCount, i + 1,
        'called');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED));
      assert.isFalse(elm.classList.contains(CLASS_MULTI));
      assert.deepEqual(res, [undefined, undefined], 'result');
    });

    it('should add class', async () => {
      browser.tabs.get.withArgs(1).resolves({
        audible: true,
        mutedInfo: {
          muted: false
        }
      });
      const i = browser.tabs.get.withArgs(1).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('img');
      const elm3 = document.createElement('button');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(elm);
      const res = await func(elm, 2);
      assert.strictEqual(browser.tabs.get.withArgs(1).callCount, i + 1,
        'called');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED));
      assert.isTrue(elm.classList.contains(CLASS_MULTI));
      assert.deepEqual(res, [undefined, undefined], 'result');
    });
  });

  describe('add highlight class to tabs', () => {
    const func = mjs.addHighlightToTabs;

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

    it('should get empty array if array is empty', async () => {
      const res = await func([]);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array if tab not found', async () => {
      const res = await func([1]);
      assert.deepEqual(res, [], 'result');
    });

    it('should get array', async () => {
      browser.tabs.get.withArgs(1).resolves({
        audible: true,
        mutedInfo: {
          muted: false
        }
      });
      const i = browser.tabs.get.withArgs(1).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('img');
      const elm3 = document.createElement('button');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(elm);
      const res = await func([1]);
      assert.strictEqual(browser.tabs.get.withArgs(1).callCount, i + 1,
        'called');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED));
      assert.deepEqual(res, [[undefined, undefined]], 'result');
    });

    it('should get array', async () => {
      browser.tabs.get.withArgs(1).resolves({
        audible: true,
        mutedInfo: {
          muted: false
        }
      });
      browser.tabs.get.withArgs(2).resolves({
        audible: true,
        mutedInfo: {
          muted: false
        }
      });
      const i = browser.tabs.get.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('img');
      const elm3 = document.createElement('button');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('img');
      const elm6 = document.createElement('button');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      elm4.dataset.tabId = '2';
      elm5.appendChild(elm4);
      elm6.appendChild(elm5);
      body.appendChild(elm);
      body.appendChild(elm4);
      const res = await func([1, 2]);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, 'called');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED));
      assert.isTrue(elm4.classList.contains(HIGHLIGHTED));
      assert.deepEqual(res, [[undefined, undefined], [undefined, undefined]],
        'result');
    });
  });

  describe('remove hightlight class from tab', () => {
    const func = mjs.removeHighlight;

    it('should not remove class if argument not given', async () => {
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should not remove class if argument is not element', async () => {
      const res = await func('foo');
      assert.deepEqual(res, [], 'result');
    });

    it('should not remove class if argument is not tab', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm);
      assert.deepEqual(res, [], 'result');
    });

    it('should remove class', async () => {
      browser.tabs.get.withArgs(1).resolves({
        audible: true,
        mutedInfo: {
          muted: false
        }
      });
      const i = browser.tabs.get.withArgs(1).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('img');
      const elm3 = document.createElement('button');
      const body = document.querySelector('body');
      elm.classList.add(HIGHLIGHTED, CLASS_MULTI);
      elm.dataset.tabId = '1';
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.withArgs(1).callCount, i + 1,
        'called');
      assert.isFalse(elm.classList.contains(HIGHLIGHTED));
      assert.isFalse(elm.classList.contains(CLASS_MULTI));
      assert.deepEqual(res, [undefined, undefined], 'result');
    });
  });

  describe('remove highlight class from tabs', () => {
    const func = mjs.removeHighlightFromTabs;

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

    it('should get empty array if array is empty', async () => {
      const res = await func([]);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array if tab not found', async () => {
      const res = await func([1]);
      assert.deepEqual(res, [], 'result');
    });

    it('should get array', async () => {
      browser.tabs.get.withArgs(1).resolves({
        audible: true,
        mutedInfo: {
          muted: false
        }
      });
      const i = browser.tabs.get.withArgs(1).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('img');
      const elm3 = document.createElement('button');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(elm);
      const res = await func([1]);
      assert.strictEqual(browser.tabs.get.withArgs(1).callCount, i + 1,
        'called');
      assert.isFalse(elm.classList.contains(HIGHLIGHTED));
      assert.deepEqual(res, [[undefined, undefined]], 'result');
    });

    it('should get array', async () => {
      browser.tabs.get.withArgs(1).resolves({
        audible: true,
        mutedInfo: {
          muted: false
        }
      });
      browser.tabs.get.withArgs(2).resolves({
        audible: true,
        mutedInfo: {
          muted: false
        }
      });
      const i = browser.tabs.get.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('img');
      const elm3 = document.createElement('button');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('img');
      const elm6 = document.createElement('button');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      elm4.dataset.tabId = '2';
      elm5.appendChild(elm4);
      elm6.appendChild(elm5);
      body.appendChild(elm);
      body.appendChild(elm4);
      const res = await func([1, 2]);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, 'called');
      assert.isFalse(elm.classList.contains(HIGHLIGHTED));
      assert.isFalse(elm4.classList.contains(HIGHLIGHTED));
      assert.deepEqual(res, [[undefined, undefined], [undefined, undefined]],
        'result');
    });
  });
});
