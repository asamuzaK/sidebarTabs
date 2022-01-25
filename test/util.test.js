/**
 * util.test.js
 */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom, mockPort } from './mocha/setup.js';
import psl from 'psl';
import sinon from 'sinon';
import {
  CLASS_HEADING, CLASS_HEADING_LABEL, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER,
  CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP, NEW_TAB, PINNED, SESSION_SAVE,
  SIDEBAR, TAB, TAB_LIST
} from '../src/mjs/constant.js';

/* test */
import * as mjs from '../src/mjs/util.js';

describe('util', () => {
  const globalKeys = ['DOMParser', 'Node', 'NodeList', 'XMLSerializer'];
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    window = dom && dom.window;
    window.psl = psl;
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

  describe('get template', () => {
    const func = mjs.getTemplate;

    it('should throw if no argument given', async () => {
      assert.throws(() => func(), 'Expected String but got Undefined.');
    });

    it('should throw if argument is not string', async () => {
      assert.throws(() => func(1), 'Expected String but got Number.');
    });

    it('should get null', async () => {
      const res = func('foo');
      assert.isNull(res, 'result');
    });

    it('should get cloned fragment', async () => {
      const tmpl = document.createElement('template');
      const p = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = 'foo';
      tmpl.content.appendChild(p);
      body.appendChild(tmpl);
      const res = await func('foo');
      assert.strictEqual(res.nodeType, Node.ELEMENT_NODE, 'nodeType');
      assert.strictEqual(res.localName, 'p', 'localName');
    });
  });

  describe('get sidebar tab container from parent node', () => {
    const func = mjs.getSidebarTabContainer;

    it('should get null if no argument given', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null if container not found', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm);
      assert.isNull(res, 'result');
    });

    it('should get container', async () => {
      const cnt = document.createElement('div');
      const p = document.createElement('p');
      const elm = document.createElement('span');
      const body = document.querySelector('body');
      cnt.classList.add(CLASS_TAB_CONTAINER);
      p.appendChild(elm);
      cnt.appendChild(p);
      body.appendChild(cnt);
      const res = await func(elm);
      assert.isTrue(res === cnt, 'result');
    });
  });

  describe('restore sidebar tab container', () => {
    const func = mjs.restoreTabContainer;

    it('should do nothing if no argument given', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func();
      assert.strictEqual(parent.childElementCount, 1, 'result');
    });

    it('should do nothing if argument is not element', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func('foo');
      assert.strictEqual(parent.childElementCount, 1, 'result');
    });

    it('should remove element', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm);
      assert.strictEqual(parent.childElementCount, 0, 'result');
    });

    it('should remove class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const child = document.createElement('span');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_GROUP);
      elm.appendChild(child);
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm);
      assert.isFalse(elm.classList.contains(CLASS_TAB_GROUP), 'result');
    });

    it('should do nothing', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const child = document.createElement('span');
      const child2 = document.createElement('span');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_GROUP);
      elm.appendChild(child);
      elm.appendChild(child2);
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm);
      assert.isTrue(elm.classList.contains(CLASS_TAB_GROUP), 'result');
    });
  });

  describe('create sidebar tab', () => {
    const func = mjs.createSidebarTab;

    it('should get null if no argument given', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const res = await func('foo');
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      const tmpl = document.createElement('template');
      const div = document.createElement('div');
      const elm = document.createElement('div');
      const newTab = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(div);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(newTab);
      const res = await func(elm);
      assert.deepEqual(res, elm, 'result');
      assert.deepEqual(res.parentNode.nextElementSibling, newTab, 'position');
    });

    it('should get result', async () => {
      const tmpl = document.createElement('template');
      const div = document.createElement('div');
      const elm = document.createElement('div');
      const div2 = document.createElement('div');
      const newTab = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(div);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(div2);
      body.appendChild(newTab);
      const res = await func(elm, div2);
      assert.deepEqual(res, elm, 'result');
      assert.deepEqual(res.parentNode.nextElementSibling, newTab, 'position');
    });

    it('should get result', async () => {
      const tmpl = document.createElement('template');
      const div = document.createElement('div');
      const elm = document.createElement('div');
      const div2 = document.createElement('div');
      const newTab = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(div);
      div2.classList.add(CLASS_TAB_CONTAINER);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(div2);
      body.appendChild(newTab);
      const res = await func(elm, div2);
      assert.deepEqual(res, elm, 'result');
      assert.deepEqual(res.parentNode.nextElementSibling, div2, 'position');
    });
  });

  describe('get sidebar tab from parent node', () => {
    const func = mjs.getSidebarTab;

    it('should get null if no argument given', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isTrue(res === parent, 'result');
    });
  });

  describe('get sidebar tab ID', () => {
    const func = mjs.getSidebarTabId;

    it('should get null if no argument given', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.strictEqual(res, 1, 'result');
    });
  });

  describe('get sidebar tab IDs', () => {
    const func = mjs.getSidebarTabIds;

    it('should throw if no argument given', () => {
      assert.throws(() => func(), 'Expected Array but got Undefined.', 'throw');
    });

    it('should throw if argument is not array', () => {
      assert.throws(() => func(1), 'Expected Array but got Number.', 'throw');
    });

    it('should get empty array if array does not contain element', async () => {
      const res = await func(['foo']);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array if element is not tab', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func([elm]);
      assert.deepEqual(res, [], 'result');
    });

    it('should get array', async () => {
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func([elm, elm2]);
      assert.deepEqual(res, [1, 2], 'result');
    });
  });

  describe('get sidebar tab index', () => {
    const func = mjs.getSidebarTabIndex;

    it('should get null if no argument given', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null if argument is not element', async () => {
      const res = await func('foo');
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm);
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(res, 0, 'result');
    });

    it('should get result', async () => {
      const prev = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      prev.classList.add(TAB);
      prev.dataset.tabId = '1';
      elm.classList.add(TAB);
      elm.dataset.tabId = '2';
      body.appendChild(prev);
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(res, 1, 'result');
    });
  });

  describe('get tabs in range', () => {
    const func = mjs.getTabsInRange;

    it('should get empty array if no argument given', async () => {
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array if 2nd argument not given', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array if given arguments are not tabs', async () => {
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func(elm);
      assert.deepEqual(res, [], 'result');
    });

    it('should get result', async () => {
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      body.appendChild(elm5);
      const res = await func(elm2, elm4);
      assert.strictEqual(res.length, 3, 'length');
      assert.isTrue(res[0] === elm2, 'result');
      assert.isTrue(res[1] === elm3, 'result');
      assert.isTrue(res[2] === elm4, 'result');
    });

    it('should get result', async () => {
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      body.appendChild(elm5);
      const res = await func(elm3, elm5);
      assert.strictEqual(res.length, 3, 'length');
      assert.isTrue(res[0] === elm3, 'result');
      assert.isTrue(res[1] === elm4, 'result');
      assert.isTrue(res[2] === elm5, 'result');
    });

    it('should get result', async () => {
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const elm5 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      body.appendChild(elm5);
      const res = await func(elm4, elm);
      assert.strictEqual(res.length, 4, 'length');
      assert.isTrue(res[0] === elm, 'result');
      assert.isTrue(res[1] === elm2, 'result');
      assert.isTrue(res[2] === elm3, 'result');
      assert.isTrue(res[3] === elm4, 'result');
    });
  });

  describe('get next tab', () => {
    const func = mjs.getNextTab;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get null', () => {
      const div = document.createElement('div');
      const body = document.querySelector('body');
      body.appendChild(div);
      const res = func(div);
      assert.isNull(res, 'result');
    });

    it('should get result', () => {
      const group = document.createElement('div');
      const group2 = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const newtab = document.createElement('div');
      const body = document.querySelector('body');
      div.dataset.tabId = '1';
      div.classList.add(TAB);
      div2.dataset.tabId = '2';
      div2.classList.add(TAB);
      group.appendChild(div);
      group.appendChild(div2);
      div3.dataset.tabId = '3';
      div3.classList.add(TAB);
      group2.appendChild(div3);
      newtab.id = NEW_TAB;
      body.appendChild(group);
      body.appendChild(group2);
      body.appendChild(newtab);
      const res = func(div);
      assert.deepEqual(res, div2, 'result');
    });

    it('should get result', () => {
      const group = document.createElement('div');
      const group2 = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const newtab = document.createElement('div');
      const body = document.querySelector('body');
      div.dataset.tabId = '1';
      div.classList.add(TAB);
      div2.dataset.tabId = '2';
      div2.classList.add(TAB);
      group.appendChild(div);
      group.appendChild(div2);
      div3.dataset.tabId = '3';
      div3.classList.add(TAB);
      group2.appendChild(div3);
      newtab.id = NEW_TAB;
      body.appendChild(group);
      body.appendChild(group2);
      body.appendChild(newtab);
      const res = func(div2);
      assert.deepEqual(res, div3, 'result');
    });

    it('should get result', () => {
      const group = document.createElement('div');
      const group2 = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const newtab = document.createElement('div');
      const body = document.querySelector('body');
      div.dataset.tabId = '1';
      div.classList.add(TAB);
      div2.dataset.tabId = '2';
      div2.classList.add(TAB);
      group.classList.add(CLASS_TAB_COLLAPSED);
      group.appendChild(div);
      group.appendChild(div2);
      div3.dataset.tabId = '3';
      div3.classList.add(TAB);
      group2.appendChild(div3);
      newtab.id = NEW_TAB;
      body.appendChild(group);
      body.appendChild(group2);
      body.appendChild(newtab);
      const res = func(div, true);
      assert.deepEqual(res, div3, 'result');
    });

    it('should get result', () => {
      const group = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const newtab = document.createElement('div');
      const body = document.querySelector('body');
      div.dataset.tabId = '1';
      div.classList.add(TAB);
      div2.dataset.tabId = '2';
      div2.classList.add(TAB);
      group.classList.add(CLASS_TAB_COLLAPSED);
      group.appendChild(div);
      group.appendChild(div2);
      newtab.id = NEW_TAB;
      body.appendChild(group);
      body.appendChild(newtab);
      const res = func(div, true);
      assert.isNull(res, 'result');
    });
  });

  describe('get previous tab', () => {
    const func = mjs.getPreviousTab;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get null', () => {
      const div = document.createElement('div');
      const body = document.querySelector('body');
      body.appendChild(div);
      const res = func(div);
      assert.isNull(res, 'result');
    });

    it('should get null', () => {
      const group = document.createElement('div');
      const div = document.createElement('div');
      const heading = document.createElement('div');
      const body = document.querySelector('body');
      div.dataset.tabId = '1';
      div.classList.add(TAB);
      heading.classList.add(CLASS_HEADING);
      group.appendChild(heading);
      group.appendChild(div);
      body.appendChild(group);
      const res = func(div);
      assert.isNull(res, 'result');
    });

    it('should get result', () => {
      const group = document.createElement('div');
      const group2 = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const heading = document.createElement('div');
      const heading2 = document.createElement('div');
      const body = document.querySelector('body');
      div.dataset.tabId = '1';
      div.classList.add(TAB);
      heading.classList.add(CLASS_HEADING);
      group.appendChild(heading);
      group.appendChild(div);
      div2.dataset.tabId = '2';
      div2.classList.add(TAB);
      div3.dataset.tabId = '3';
      div3.classList.add(TAB);
      heading2.classList.add(CLASS_HEADING);
      group2.appendChild(heading2);
      group2.appendChild(div2);
      group2.appendChild(div3);
      body.appendChild(group);
      body.appendChild(group2);
      const res = func(div3);
      assert.deepEqual(res, div2, 'result');
    });

    it('should get result', () => {
      const group = document.createElement('div');
      const group2 = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const heading = document.createElement('div');
      const heading2 = document.createElement('div');
      const body = document.querySelector('body');
      div.dataset.tabId = '1';
      div.classList.add(TAB);
      div2.dataset.tabId = '2';
      div2.classList.add(TAB);
      heading.classList.add(CLASS_HEADING);
      group.appendChild(heading);
      group.appendChild(div);
      group.appendChild(div2);
      div3.dataset.tabId = '3';
      div3.classList.add(TAB);
      heading2.classList.add(CLASS_HEADING);
      group2.appendChild(heading2);
      group2.appendChild(div3);
      body.appendChild(group);
      body.appendChild(group2);
      const res = func(div3);
      assert.deepEqual(res, div2, 'result');
    });

    it('should get result', () => {
      const group = document.createElement('div');
      const group2 = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const heading = document.createElement('div');
      const heading2 = document.createElement('div');
      const body = document.querySelector('body');
      div.dataset.tabId = '1';
      div.classList.add(TAB);
      div2.dataset.tabId = '2';
      div2.classList.add(TAB);
      heading.classList.add(CLASS_HEADING);
      group.classList.add(CLASS_TAB_COLLAPSED);
      group.appendChild(heading);
      group.appendChild(div);
      group.appendChild(div2);
      div3.dataset.tabId = '3';
      div3.classList.add(TAB);
      heading2.classList.add(CLASS_HEADING);
      group2.appendChild(heading2);
      group2.appendChild(div3);
      body.appendChild(group);
      body.appendChild(group2);
      const res = func(div3, true);
      assert.deepEqual(res, div, 'result');
    });
  });

  describe('is newtab', () => {
    const func = mjs.isNewTab;

    it('should get false if no argument given', async () => {
      const res = await func();
      assert.isFalse(res, 'result');
    });

    it('should get false', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isFalse(res, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = NEW_TAB;
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isTrue(res, 'result');
    });
  });

  describe('get tab list from sessions', () => {
    const func = mjs.getSessionTabList;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not string', async () => {
      await func(1).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Number.',
          'throw');
      });
    });

    it('should get null', async () => {
      browser.windows.getCurrent.resolves({
        id: 1
      });
      browser.sessions.getWindowValue.withArgs(1, 'foo').resolves(undefined);
      const i = browser.windows.getCurrent.callCount;
      const j = browser.sessions.getWindowValue.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1,
        'called windows');
      assert.strictEqual(browser.sessions.getWindowValue.callCount, j + 1,
        'called sessions');
      assert.isNull(res, 'result');
    });

    it('should get value', async () => {
      browser.windows.getCurrent.resolves({
        id: 1
      });
      browser.sessions.getWindowValue.withArgs(1, 'foo')
        .resolves('{"bar":"baz"}');
      const i = browser.windows.getCurrent.callCount;
      const j = browser.sessions.getWindowValue.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1,
        'called windows');
      assert.strictEqual(browser.sessions.getWindowValue.callCount, j + 1,
        'called sessions');
      assert.deepEqual(res, {
        bar: 'baz'
      }, 'result');
    });

    it('should get value', async () => {
      browser.windows.getCurrent.resolves({
        id: 1
      });
      browser.sessions.getWindowValue.withArgs(1, 'foo')
        .resolves('{"bar":"baz"}');
      const i = browser.windows.getCurrent.callCount;
      const j = browser.sessions.getWindowValue.callCount;
      const res = await func('foo', 1);
      assert.strictEqual(browser.windows.getCurrent.callCount, i,
        'not called windows');
      assert.strictEqual(browser.sessions.getWindowValue.callCount, j + 1,
        'called sessions');
      assert.deepEqual(res, {
        bar: 'baz'
      }, 'result');
    });
  });

  describe('save tab list to sessions', () => {
    const func = mjs.saveSessionTabList;
    beforeEach(() => {
      mjs.mutex.clear();
    });
    afterEach(() => {
      mjs.mutex.clear();
    });

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.');
      });
    });

    it('should throw', async () => {
      await func('foo').catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.');
      });
    });

    it('should not call function if incognito', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: true
      });
      const i = browser.sessions.setWindowValue.callCount;
      const res = await func('foo', 1);
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i,
        'not called');
      assert.isFalse(res, 'result');
    });

    it('should not call function if mutex has window ID', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: false
      });
      mjs.mutex.add(1);
      const i = browser.sessions.setWindowValue.callCount;
      const res = await func('foo', 1);
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i,
        'not called');
      assert.isFalse(res, 'result');
    });

    it('should throw', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const stubGetValue = browser.sessions.getWindowValue.withArgs(1, TAB_LIST)
        .rejects(new Error('error'));
      await func('foo', 1).catch(e => {
        assert.strictEqual(e.message, 'error', 'error');
      });
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubGetValue.calledOnce, 'called');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const stubGetValue = browser.sessions.getWindowValue.withArgs(1, TAB_LIST)
        .resolves(undefined);
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'http://example.com',
            containerIndex: 0
          },
          1: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://example.com',
            containerIndex: 1
          },
          2: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://www.example.com',
            containerIndex: 1
          }
        }
      });
      const stubSetValue =
        browser.sessions.setWindowValue.withArgs(1, 'tabList', arg);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const frag = document.createDocumentFragment();
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'http://example.com'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(CLASS_TAB_COLLAPSED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm3.classList.add(TAB);
      elm3.classList.add(CLASS_TAB_COLLAPSED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://www.example.com'
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      frag.appendChild(parent);
      frag.appendChild(parent2);
      const domstr = new XMLSerializer().serializeToString(frag);
      const res = await func(domstr, 1);
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.isTrue(stubGetValue.calledOnce, 'called get');
      assert.isTrue(stubSetValue.calledOnce, 'called set');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
      assert.isTrue(res, 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const stubGetValue = browser.sessions.getWindowValue
        .withArgs(1, TAB_LIST).resolves(undefined);
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'http://example.com',
            containerIndex: 0
          },
          1: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://example.com',
            containerIndex: 1
          },
          2: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://www.example.com',
            containerIndex: 1
          }
        }
      });
      const stubSetValue = browser.sessions.setWindowValue
        .withArgs(1, 'tabList', arg);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const frag = document.createDocumentFragment();
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'http://example.com'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(CLASS_TAB_COLLAPSED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm3.classList.add(TAB);
      elm3.classList.add(CLASS_TAB_COLLAPSED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://www.example.com'
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      frag.appendChild(parent);
      frag.appendChild(parent2);
      const domstr = new XMLSerializer().serializeToString(frag);
      const res = await Promise.all([
        func(domstr, 1),
        func(domstr, 1)
      ]);
      assert.isTrue(stubWin.calledTwice, 'called window');
      assert.isTrue(stubGetValue.calledOnce, 'called get');
      assert.isTrue(stubSetValue.calledOnce, 'called set');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
      assert.deepEqual(res, [true, false], 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const stubGetValue = browser.sessions.getWindowValue
        .withArgs(1, TAB_LIST).resolves(undefined);
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'http://example.com',
            containerIndex: 0
          },
          1: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://example.com',
            containerIndex: 1
          },
          2: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://www.example.com',
            containerIndex: 1
          }
        }
      });
      const stubSetValue = browser.sessions.setWindowValue
        .withArgs(1, 'tabList', arg);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const frag = document.createDocumentFragment();
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'http://example.com'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(CLASS_TAB_COLLAPSED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm3.classList.add(TAB);
      elm3.classList.add(CLASS_TAB_COLLAPSED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://www.example.com'
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      frag.appendChild(parent);
      frag.appendChild(parent2);
      const domstr = new XMLSerializer().serializeToString(frag);
      const res = await func(domstr, 1).then(() => func(domstr, 1));
      assert.isTrue(stubWin.calledTwice, 'called window');
      assert.isTrue(stubGetValue.calledTwice, 'called get');
      assert.isTrue(stubSetValue.calledTwice, 'called set');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
      assert.isTrue(res, 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const stubGetValue = browser.sessions.getWindowValue.withArgs(1, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            foo: 'bar'
          }
        }));
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'http://example.com',
            containerIndex: 0
          },
          1: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://example.com',
            containerIndex: 1
          },
          2: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://www.example.com',
            containerIndex: 1
          }
        },
        prev: {
          foo: 'bar'
        }
      });
      const stubSetValue = browser.sessions.setWindowValue
        .withArgs(1, 'tabList', arg);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const frag = document.createDocumentFragment();
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'http://example.com'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(CLASS_TAB_COLLAPSED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm3.classList.add(TAB);
      elm3.classList.add(CLASS_TAB_COLLAPSED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://www.example.com'
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      frag.appendChild(parent);
      frag.appendChild(parent2);
      const domstr = new XMLSerializer().serializeToString(frag);
      const res = await func(domstr, 1);
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.isTrue(stubGetValue.calledOnce, 'called get');
      assert.isTrue(stubSetValue.calledOnce, 'called set');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
      assert.isTrue(res, 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const stubGetValue = browser.sessions.getWindowValue.withArgs(1, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            foo: 'bar'
          }
        }));
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            headingLabel: '',
            headingShown: false,
            url: 'http://example.com',
            containerIndex: 0
          },
          1: {
            collapsed: false,
            headingLabel: 'foo',
            headingShown: true,
            url: 'https://example.com',
            containerIndex: 1
          },
          2: {
            collapsed: false,
            headingLabel: 'foo',
            headingShown: true,
            url: 'https://www.example.com',
            containerIndex: 1
          }
        },
        prev: {
          foo: 'bar'
        }
      });
      const stubSetValue = browser.sessions.setWindowValue
        .withArgs(1, 'tabList', arg);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const label = document.createElement('span');
      const label2 = document.createElement('span');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const frag = document.createDocumentFragment();
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      label.classList.add(CLASS_HEADING_LABEL);
      heading.classList.add(CLASS_HEADING);
      heading.hidden = true;
      heading.appendChild(label);
      label2.classList.add(CLASS_HEADING_LABEL);
      label2.textContent = 'foo';
      heading2.classList.add(CLASS_HEADING);
      heading2.appendChild(label2);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'http://example.com'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(CLASS_TAB_COLLAPSED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm3.classList.add(TAB);
      elm3.classList.add(CLASS_TAB_COLLAPSED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://www.example.com'
      });
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent2.appendChild(heading2);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      frag.appendChild(parent);
      frag.appendChild(parent2);
      const domstr = new XMLSerializer().serializeToString(frag);
      const res = await func(domstr, 1);
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.isTrue(stubGetValue.calledOnce, 'called get');
      assert.isTrue(stubSetValue.calledOnce, 'called set');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
      assert.isTrue(res, 'result');
    });
  });

  describe('request save session', () => {
    const func = mjs.requestSaveSession;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should not call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: true
      });
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: true
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const res = await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called current window');
      assert.isFalse(stubWin.called, 'not called window');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: true
      });
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: true
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const res = await func(1);
      assert.isFalse(stubCurrentWin.called, 'not called current window');
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const res = await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called current window');
      assert.isFalse(stubWin.called, 'not called window');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_2`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const res = await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called current window');
      assert.isFalse(stubWin.called, 'not called window');
      assert.isFalse(port.postMessage.called, 'not called message');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.callsFake(msg => msg);
      mjs.ports.set(portId, port);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      heading.classList.add(CLASS_HEADING);
      heading2.classList.add(CLASS_HEADING);
      elm.classList.add(TAB);
      elm2.classList.add(TAB);
      elm3.classList.add(TAB);
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent2.appendChild(heading2);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called current window');
      assert.isFalse(stubWin.called, 'not called window');
      assert.isTrue(port.postMessage.calledOnce, 'called message');
      assert.isObject(res, 'result');
      assert.property(res, SESSION_SAVE, 'property');
      assert.property(res[SESSION_SAVE], 'windowId', 'property');
      assert.property(res[SESSION_SAVE], 'domString', 'property');
      assert.isNumber(res[SESSION_SAVE].windowId, 'value');
      assert.isString(res[SESSION_SAVE].domString, 'value');
    });

    it('should call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.callsFake(msg => msg);
      mjs.ports.set(portId, port);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      heading.classList.add(CLASS_HEADING);
      heading2.classList.add(CLASS_HEADING);
      elm.classList.add(TAB);
      elm2.classList.add(TAB);
      elm3.classList.add(TAB);
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent2.appendChild(heading2);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = await func(1);
      assert.isFalse(stubCurrentWin.called, 'not called current window');
      assert.isTrue(stubWin.calledOnce, 'not called window');
      assert.isTrue(port.postMessage.calledOnce, 'called message');
      assert.isObject(res, 'result');
      assert.property(res, SESSION_SAVE, 'property');
      assert.property(res[SESSION_SAVE], 'windowId', 'property');
      assert.property(res[SESSION_SAVE], 'domString', 'property');
      assert.isNumber(res[SESSION_SAVE].windowId, 'value');
      assert.isString(res[SESSION_SAVE].domString, 'value');
    });
  });

  describe('activate tab', () => {
    const func = mjs.activateTab;

    it('should get null if no argument given', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null if tab not found', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm);
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.tabs.update.withArgs(1, {
        active: true
      }).resolves(true);
      const i = browser.tabs.update.withArgs(1, {
        active: true
      }).callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.update.callCount, i + 1, 'called');
      assert.isTrue(res, 'result');
    });
  });

  describe('scroll tab into view', () => {
    const func = mjs.scrollTabIntoView;

    it('should not call function', async () => {
      const pinned = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      const stubPinned = sinon.stub(pinned, 'getBoundingClientRect').returns({
        top: 0,
        bottom: 100
      });
      const stubNewTab = sinon.stub(newTab, 'getBoundingClientRect').returns({
        top: 300,
        bottom: 400
      });
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(newTab);
      await func();
      assert.isFalse(stubPinned.called, 'not called');
      assert.isFalse(stubNewTab.called, 'not called');
    });

    it('should not call function', async () => {
      const pinned = document.createElement('p');
      const newTab = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      const stubPinned = sinon.stub(pinned, 'getBoundingClientRect').returns({
        top: 0,
        bottom: 100
      });
      const stubNewTab = sinon.stub(newTab, 'getBoundingClientRect').returns({
        top: 300,
        bottom: 400
      });
      const stubElm = sinon.stub(elm, 'getBoundingClientRect').returns({
        top: 150,
        bottom: 250
      });
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isFalse(stubPinned.called, 'not called');
      assert.isFalse(stubNewTab.called, 'not called');
      assert.isFalse(stubElm.called, 'not called');
    });

    it('should not call function', async () => {
      const pinned = document.createElement('p');
      const newTab = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      const stubPinned = sinon.stub(pinned, 'getBoundingClientRect').returns({
        top: 0,
        bottom: 100
      });
      const stubNewTab = sinon.stub(newTab, 'getBoundingClientRect').returns({
        top: 300,
        bottom: 400
      });
      const stubElm = sinon.stub(elm, 'getBoundingClientRect').returns({
        top: 150,
        bottom: 250
      });
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      elm.dataset.tab = JSON.stringify({
        active: false
      });
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isFalse(stubPinned.called, 'not called');
      assert.isFalse(stubNewTab.called, 'not called');
      assert.isFalse(stubElm.called, 'not called');
    });

    it('should not call function', async () => {
      const pinned = document.createElement('p');
      const newTab = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      const stubPinned = sinon.stub(pinned, 'getBoundingClientRect').returns({
        top: 0,
        bottom: 100
      });
      const stubNewTab = sinon.stub(newTab, 'getBoundingClientRect').returns({
        top: 300,
        bottom: 400
      });
      const stubElm = sinon.stub(elm, 'getBoundingClientRect').returns({
        top: 150,
        bottom: 250
      });
      const stubFunc = sinon.stub();
      elm.dataset.tab = JSON.stringify({
        active: true
      });
      elm.scrollIntoView = stubFunc;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isTrue(stubPinned.called, 'called');
      assert.isTrue(stubNewTab.called, 'called');
      assert.isTrue(stubElm.called, 'called');
      assert.isFalse(stubFunc.called, 'not called');
    });

    it('should not call function', async () => {
      const pinned = document.createElement('p');
      const newTab = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      const stubPinned = sinon.stub(pinned, 'getBoundingClientRect').returns({
        top: 0,
        bottom: 100
      });
      const stubNewTab = sinon.stub(newTab, 'getBoundingClientRect').returns({
        top: 300,
        bottom: 400
      });
      const stubElm = sinon.stub(elm, 'getBoundingClientRect').returns({
        top: 150,
        bottom: 250
      });
      const stubFunc = sinon.stub();
      elm.dataset.tab = JSON.stringify({
        active: false
      });
      elm.scrollIntoView = stubFunc;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isFalse(stubPinned.called, 'not called');
      assert.isFalse(stubNewTab.called, 'not called');
      assert.isFalse(stubElm.called, 'not called');
      assert.isFalse(stubFunc.called, 'not called');
    });

    it('should call function', async () => {
      const pinned = document.createElement('p');
      const newTab = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      const stubPinned = sinon.stub(pinned, 'getBoundingClientRect').returns({
        top: 0,
        bottom: 100
      });
      const stubNewTab = sinon.stub(newTab, 'getBoundingClientRect').returns({
        top: 300,
        bottom: 400
      });
      const stubElm = sinon.stub(elm, 'getBoundingClientRect').returns({
        top: 350,
        bottom: 450
      });
      const stubFunc = sinon.stub().withArgs({
        behavior: 'smooth',
        block: 'center'
      });
      elm.dataset.tab = JSON.stringify({
        active: true
      });
      elm.scrollIntoView = stubFunc;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isTrue(stubPinned.calledOnce, 'called');
      assert.isTrue(stubNewTab.calledOnce, 'called');
      assert.isTrue(stubElm.calledOnce, 'called');
      assert.isTrue(stubFunc.calledOnce, 'called');
    });

    it('should call function', async () => {
      const pinned = document.createElement('p');
      const newTab = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      const stubPinned = sinon.stub(pinned, 'getBoundingClientRect').returns({
        top: 0,
        bottom: 0
      });
      const stubNewTab = sinon.stub(newTab, 'getBoundingClientRect').returns({
        top: 300,
        bottom: 400
      });
      const stubElm = sinon.stub(elm, 'getBoundingClientRect').returns({
        top: -50,
        bottom: 50
      });
      const stubFunc = sinon.stub().withArgs({
        behavior: 'smooth',
        block: 'start'
      });
      elm.dataset.tab = JSON.stringify({
        active: true
      });
      elm.scrollIntoView = stubFunc;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isTrue(stubPinned.calledOnce, 'called');
      assert.isTrue(stubNewTab.calledOnce, 'called');
      assert.isTrue(stubElm.calledOnce, 'called');
      assert.isTrue(stubFunc.calledOnce, 'called');
    });

    it('should call function', async () => {
      const pinned = document.createElement('p');
      const newTab = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      const stubPinned = sinon.stub(pinned, 'getBoundingClientRect').returns({
        top: 100,
        bottom: 200
      });
      const stubNewTab = sinon.stub(newTab, 'getBoundingClientRect').returns({
        top: 300,
        bottom: 400
      });
      const stubElm = sinon.stub(elm, 'getBoundingClientRect').returns({
        top: 50,
        bottom: 150
      });
      const stubFunc = sinon.stub().withArgs({
        behavior: 'smooth',
        block: 'center'
      });
      elm.dataset.tab = JSON.stringify({
        active: true
      });
      elm.scrollIntoView = stubFunc;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isTrue(stubPinned.calledOnce, 'called');
      assert.isTrue(stubNewTab.calledOnce, 'called');
      assert.isTrue(stubElm.calledOnce, 'called');
      assert.isTrue(stubFunc.calledOnce, 'called');
    });
  });

  describe('switch tab', () => {
    const func = mjs.switchTab;

    it('should get null', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const res = await func({});
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.update.callCount;
      const opt = {
        deltaY: 3,
        windowId: 1
      };
      browser.tabs.query.resolves([{ id: 1 }]);
      const res = await func(opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.update.callCount;
      const group = document.createElement('div');
      const heading = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const body = document.querySelector('body');
      heading.classList.add(CLASS_HEADING);
      div.classList.add(TAB);
      div.dataset.tabId = '1';
      div2.classList.add(TAB);
      div2.dataset.tabId = '2';
      group.appendChild(heading);
      group.appendChild(div);
      group.appendChild(div2);
      body.appendChild(group);
      const opt = {
        deltaY: 0,
        windowId: 1
      };
      browser.tabs.query.resolves([{ id: 1 }]);
      browser.tabs.update.resolves({});
      const res = await func(opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.update.callCount;
      const group = document.createElement('div');
      const heading = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const body = document.querySelector('body');
      heading.classList.add(CLASS_HEADING);
      div.classList.add(TAB);
      div.dataset.tabId = '1';
      div2.classList.add(TAB);
      div2.dataset.tabId = '2';
      group.appendChild(heading);
      group.appendChild(div);
      group.appendChild(div2);
      body.appendChild(group);
      const opt = {
        deltaY: 3,
        windowId: 1
      };
      browser.tabs.query.resolves([{ id: 1 }]);
      browser.tabs.update.resolves({});
      const res = await func(opt);
      assert.strictEqual(browser.tabs.update.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.update.callCount;
      const group = document.createElement('div');
      const heading = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const body = document.querySelector('body');
      heading.classList.add(CLASS_HEADING);
      div.classList.add(TAB);
      div.dataset.tabId = '1';
      div2.classList.add(TAB);
      div2.dataset.tabId = '2';
      group.appendChild(heading);
      group.appendChild(div);
      group.appendChild(div2);
      body.appendChild(group);
      const opt = {
        deltaY: 3,
        windowId: 1
      };
      browser.tabs.query.resolves([{ id: 2 }]);
      browser.tabs.update.resolves({});
      const res = await func(opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.update.callCount;
      const group = document.createElement('div');
      const heading = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const body = document.querySelector('body');
      heading.classList.add(CLASS_HEADING);
      div.classList.add(TAB);
      div.dataset.tabId = '1';
      div2.classList.add(TAB);
      div2.dataset.tabId = '2';
      group.appendChild(heading);
      group.appendChild(div);
      group.appendChild(div2);
      body.appendChild(group);
      const opt = {
        deltaY: -3,
        windowId: 1
      };
      browser.tabs.query.resolves([{ id: 1 }]);
      browser.tabs.update.resolves({});
      const res = await func(opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.update.callCount;
      const group = document.createElement('div');
      const heading = document.createElement('div');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const body = document.querySelector('body');
      heading.classList.add(CLASS_HEADING);
      div.classList.add(TAB);
      div.dataset.tabId = '1';
      div2.classList.add(TAB);
      div2.dataset.tabId = '2';
      group.appendChild(heading);
      group.appendChild(div);
      group.appendChild(div2);
      body.appendChild(group);
      const opt = {
        deltaY: -3,
        windowId: 1
      };
      browser.tabs.query.resolves([{ id: 2 }]);
      browser.tabs.update.resolves({});
      const res = await func(opt);
      assert.strictEqual(browser.tabs.update.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('create URL match string', () => {
    const func = mjs.createUrlMatchString;

    it('should throw', () => {
      assert.throws(() => func(), 'Expected String but got Undefined.',
        'throw');
    });

    it('should throw', () => {
      assert.throws(() => func(''));
    });

    it('should throw', () => {
      assert.throws(() => func('foo'));
    });

    it('should get result', () => {
      const url = 'file:///C:\\Program Files';
      const res = func(url);
      assert.strictEqual(res, 'file:///*', 'result');
    });

    it('should get result', () => {
      const url = 'http://www.example.com/foo';
      const res = func(url);
      assert.strictEqual(res, '*://*.example.com/*', 'result');
    });

    it('should get result', () => {
      const url = 'https://example.com/foo';
      const res = func(url);
      assert.strictEqual(res, '*://*.example.com/*', 'result');
    });

    it('should get result', () => {
      const url = 'http://93.184.216.34/foo';
      const res = func(url);
      assert.strictEqual(res, '*://93.184.216.34/*', 'result');
    });

    it('should get result', () => {
      const url = 'https://93.184.216.34/foo';
      const res = func(url);
      assert.strictEqual(res, '*://93.184.216.34/*', 'result');
    });

    it('should get result', () => {
      const url = 'https://[::1]/foo';
      const res = func(url);
      assert.strictEqual(res, '*://[::1]/*', 'result');
    });

    it('should get result', () => {
      const url = 'wss://example.com/foo';
      const res = func(url);
      assert.strictEqual(res, 'wss://*.example.com/*', 'result');
    });

    it('should get result', () => {
      const url = 'wss://93.184.216.34/foo';
      const res = func(url);
      assert.strictEqual(res, 'wss://93.184.216.34/*', 'result');
    });
  });

  describe('store closeTabsByDoubleClick user value', async () => {
    const func = mjs.storeCloseTabsByDoubleClickValue;

    it('should store value', async () => {
      const obj = {
        closeTabsByDoubleClick: {
          id: 'closeTabsByDoubleClick',
          checked: false,
          value: ''
        }
      };
      const i = browser.storage.local.set.withArgs(obj).callCount;
      await func(false);
      assert.strictEqual(browser.storage.local.set.withArgs(obj).callCount,
        i + 1, 'called');
    });

    it('should store value', async () => {
      const obj = {
        closeTabsByDoubleClick: {
          id: 'closeTabsByDoubleClick',
          checked: true,
          value: 'foo'
        }
      };
      const i = browser.storage.local.set.withArgs(obj).callCount;
      browser.browserSettings.closeTabsByDoubleClick.get.withArgs({}).returns({
        value: true,
        levelOfControl: 'foo'
      });
      await func(true);
      assert.strictEqual(browser.storage.local.set.withArgs(obj).callCount,
        i + 1, 'called');
    });
  });
});
