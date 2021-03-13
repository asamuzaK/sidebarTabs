/**
 * background-main.test.js
 */

import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser } from './mocha/setup.js';
import * as mjs from '../src/mjs/background-main.js';
import { SIDEBAR_STATE_UPDATE, TOGGLE_STATE } from '../src/mjs/constant.js';

describe('background-main', () => {
  beforeEach(() => {
    browser._sandbox.reset();
    browser.i18n.getMessage.callsFake((...args) => args.toString());
    browser.permissions.contains.resolves(true);
    global.browser = browser;
  });
  afterEach(() => {
    delete global.browser;
    browser._sandbox.reset();
  });

  it('should get browser object', () => {
    assert.isObject(browser, 'browser');
  });

  describe('sidebar', () => {
    assert.instanceOf(mjs.sidebar, Map, 'instance');
  });

  describe('set sidebar state', () => {
    const func = mjs.setSidebarState;
    beforeEach(() => {
      mjs.sidebar.clear();
    });
    afterEach(() => {
      mjs.sidebar.clear();
    });

    it('should set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        sessionId: undefined,
        type: 'normal'
      });
      const stubWin = browser.windows.get.withArgs(4).resolves({
        id: 4,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 3 }).resolves(true);
      await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isFalse(stubWin.called, 'not called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isTrue(mjs.sidebar.has(3), 'entry');
      assert.deepEqual(mjs.sidebar.get(3), {
        isOpen: true,
        sessionId: undefined,
        windowId: 3
      }, 'value');
      assert.isFalse(mjs.sidebar.has(4), 'entry');
    });

    it('should set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        sessionId: undefined,
        type: 'normal'
      });
      const stubWin = browser.windows.get.withArgs(4).resolves({
        id: 4,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 3 }).resolves(true);
      await func(browser.windows.WINDOW_ID_CURRENT);
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isFalse(stubWin.called, 'not called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isTrue(mjs.sidebar.has(3), 'entry');
      assert.deepEqual(mjs.sidebar.get(3), {
        isOpen: true,
        sessionId: undefined,
        windowId: 3
      }, 'value');
      assert.isFalse(mjs.sidebar.has(4), 'entry');
    });

    it('should set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        sessionId: undefined,
        type: 'normal'
      });
      const stubWin = browser.windows.get.withArgs(4).resolves({
        id: 4,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 4 }).resolves(true);
      await func(4);
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isFalse(mjs.sidebar.has(3), 'entry');
      assert.isTrue(mjs.sidebar.has(4), 'entry');
      assert.deepEqual(mjs.sidebar.get(4), {
        isOpen: true,
        sessionId: undefined,
        windowId: 4
      }, 'value');
    });

    it('should set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        sessionId: undefined,
        type: 'normal'
      });
      const stubWin = browser.windows.get.withArgs(4).resolves({
        id: 4,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 4 }).resolves(false);
      mjs.sidebar.set(3, {
        isOpen: true,
        sessionId: undefined,
        windowId: 3
      });
      mjs.sidebar.set(4, {
        isOpen: true,
        sessionId: undefined,
        windowId: 4
      });
      await func(4);
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isTrue(mjs.sidebar.has(3), 'entry');
      assert.deepEqual(mjs.sidebar.get(3), {
        isOpen: true,
        sessionId: undefined,
        windowId: 3
      }, 'value');
      assert.isTrue(mjs.sidebar.has(4), 'entry');
      assert.deepEqual(mjs.sidebar.get(4), {
        isOpen: false,
        sessionId: undefined,
        windowId: 4
      }, 'value');
    });

    it('should not set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        sessionId: undefined,
        type: 'normal'
      });
      const stubWin = browser.windows.get.withArgs(4).resolves({
        id: 4,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen = browser.sidebarAction.isOpen.resolves(true);
      await func(browser.windows.WINDOW_ID_NONE);
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(stubWin.called, 'not called');
      assert.isFalse(stubIsOpen.called, 'not called');
      assert.isFalse(mjs.sidebar.has(3), 'entry');
      assert.isFalse(mjs.sidebar.has(4), 'entry');
    });

    it('should not set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        sessionId: undefined,
        type: 'popup'
      });
      const stubIsOpen = browser.sidebarAction.isOpen.resolves(true);
      await func();
      assert.isTrue(stubCurrentWin.called, 'called');
      assert.isFalse(stubIsOpen.called, 'not called');
      assert.isFalse(mjs.sidebar.has(3), 'entry');
    });
  });

  describe('remove sidebar state', () => {
    const func = mjs.removeSidebarState;
    beforeEach(() => {
      mjs.sidebar.clear();
    });
    afterEach(() => {
      mjs.sidebar.clear();
    });

    it('should remove entry', async () => {
      mjs.sidebar.set(1, {});
      const res = await func(1);
      assert.isFalse(mjs.sidebar.has(1), 'entry');
      assert.isTrue(res, 'result');
    });

    it('should get false if entry does not exist', async () => {
      const res = await func(2);
      assert.isFalse(res, 'result');
    });
  });

  describe('toggle sidebar', () => {
    const func = mjs.toggleSidebar;

    it('should call function', async () => {
      const i = browser.sidebarAction.toggle.callCount;
      const res = await func();
      assert.strictEqual(browser.sidebarAction.toggle.callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('handle runtime message', () => {
    const func = mjs.handleMsg;
    beforeEach(() => {
      mjs.sidebar.clear();
    });
    afterEach(() => {
      mjs.sidebar.clear();
    });

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

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1).resolves({
        id: 1,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 1 }).resolves(true);
      const msg = {
        [SIDEBAR_STATE_UPDATE]: {
          windowId: 1
        }
      };
      const res = await func(msg);
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isTrue(mjs.sidebar.has(1), 'entry');
      assert.deepEqual(mjs.sidebar.get(1), {
        isOpen: true,
        sessionId: undefined,
        windowId: 1
      }, 'value');
      assert.deepEqual(res, [undefined], 'result');
    });
  });

  describe('handle command', () => {
    const func = mjs.handleCmd;
    beforeEach(() => {
      mjs.sidebar.clear();
    });
    afterEach(() => {
      mjs.sidebar.clear();
    });

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'message');
      });
    });

    it('should get null', async () => {
      const res = await func('foo');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.getCurrent.resolves({
        id: 1,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 1 }).resolves(true);
      mjs.sidebar.set(1, {
        isOpen: false,
        sessionId: undefined,
        windowId: 1
      });
      const res = await func(TOGGLE_STATE);
      assert.isTrue(browser.sidebarAction.toggle.calledOnce, 'called');
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isTrue(mjs.sidebar.has(1), 'entry');
      assert.deepEqual(mjs.sidebar.get(1), {
        isOpen: true,
        sessionId: undefined,
        windowId: 1
      }, 'value');
      assert.isUndefined(res, 'result');
    });
  });
});
