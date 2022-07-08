/**
 * port.test.js
 */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, mockPort } from './mocha/setup.js';
import { SIDEBAR } from '../src/mjs/constant.js';
import sinon from 'sinon';

/* test */
import * as mjs from '../src/mjs/port.js';

describe('port', () => {
  beforeEach(() => {
    browser._sandbox.reset();
    browser.permissions.contains.resolves(true);
    browser.runtime.connect.callsFake(mockPort);
    global.browser = browser;
  });
  afterEach(() => {
    delete global.browser;
    browser._sandbox.reset();
  });

  it('should get browser object', () => {
    assert.isObject(browser, 'browser');
  });

  describe('ports', () => {
    assert.instanceOf(mjs.ports, Map, 'instance');
  });

  describe('remove port', () => {
    const func = mjs.removePort;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should get false', async () => {
      const res = await func();
      assert.isFalse(res, 'result');
    });

    it('should get false', async () => {
      mjs.ports.set('foo', {});
      const res = await func('bar');
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.isFalse(res, 'result');
    });

    it('should get true', async () => {
      mjs.ports.set('foo', {});
      const res = await func('foo');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.isTrue(res, 'result');
    });
  });

  describe('port on disconnect', () => {
    const func = mjs.portOnDisconnect;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should get result', async () => {
      const res = await func();
      assert.deepEqual(res, [false], 'result');
    });

    it('should get result', async () => {
      mjs.ports.set('foo', {});
      const res = await func({
        name: 'bar'
      });
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.deepEqual(res, [false], 'result');
    });

    it('should get result', async () => {
      const stubError = sinon.stub(console, 'error');
      mjs.ports.set('foo', {});
      const res = await func({
        name: 'foo'
      });
      const { called: errCalled } = stubError;
      stubError.restore();
      assert.isFalse(errCalled, 'error called');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.deepEqual(res, [true], 'result');
    });

    it('should log error', async () => {
      const stubError = sinon.stub(console, 'error');
      mjs.ports.set('foo', {});
      const res = await func({
        error: new Error('error'),
        name: 'foo'
      });
      const { calledOnce: errCalled } = stubError;
      stubError.restore();
      assert.isTrue(errCalled, 'error called');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.deepEqual(res, [false, true], 'result');
    });
  });

  describe('add port', () => {
    const func = mjs.addPort;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should get null', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_NONE
      });
      const stubConnect = browser.runtime.connect;
      const res = await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called current windows');
      assert.isFalse(stubConnect.called, 'not called connect');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.isNull(res, 'result');
    });

    it('should get port object', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      const res = await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called current windows');
      assert.isTrue(stubConnect.calledOnce, 'called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.isObject(res, 'result');
      assert.strictEqual(res.name, `${SIDEBAR}_1`, 'name');
    });

    it('should get port object', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      const res = await func(`${SIDEBAR}_1`);
      assert.isTrue(stubCurrentWin.calledOnce, 'called current windows');
      assert.isTrue(stubConnect.calledOnce, 'called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.isObject(res, 'result');
      assert.strictEqual(res.name, `${SIDEBAR}_1`, 'name');
    });

    it('should get port object', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      mjs.ports.set(`${SIDEBAR}_1`, {
        name: `${SIDEBAR}_1`
      });
      const res = await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called current windows');
      assert.isFalse(stubConnect.called, 'not called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.isObject(res, 'result');
      assert.strictEqual(res.name, `${SIDEBAR}_1`, 'name');
    });

    it('should get port object', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      mjs.ports.set(`${SIDEBAR}_1`, {
        name: `${SIDEBAR}_1`
      });
      const res = await func(`${SIDEBAR}_1`);
      assert.isTrue(stubCurrentWin.calledOnce, 'called current windows');
      assert.isFalse(stubConnect.called, 'not called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.isObject(res, 'result');
      assert.strictEqual(res.name, `${SIDEBAR}_1`, 'name');
    });
  });

  describe('get port', () => {
    const func = mjs.getPort;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should get null', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_NONE
      });
      const stubConnect = browser.runtime.connect;
      const res = await func();
      assert.isFalse(stubCurrentWin.calledOnce, 'not called current windows');
      assert.isFalse(stubConnect.called, 'not called connect');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_NONE
      });
      const stubConnect = browser.runtime.connect;
      const res = await func(`${SIDEBAR}_1`, true);
      assert.isTrue(stubCurrentWin.calledOnce, 'called current windows');
      assert.isFalse(stubConnect.called, 'not called connect');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      const res = await func(`${SIDEBAR}_1`);
      assert.isFalse(stubCurrentWin.calledOnce, 'not called current windows');
      assert.isFalse(stubConnect.calledOnce, 'not called connect');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.isNull(res, 'result');
    });

    it('should get port object', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      const res = await func(`${SIDEBAR}_1`, true);
      assert.isTrue(stubCurrentWin.calledOnce, 'called current windows');
      assert.isTrue(stubConnect.calledOnce, 'called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.isObject(res, 'result');
      assert.strictEqual(res.name, `${SIDEBAR}_1`, 'name');
    });

    it('should get port object', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      mjs.ports.set(`${SIDEBAR}_1`, {
        name: `${SIDEBAR}_1`
      });
      const res = await func(`${SIDEBAR}_1`);
      assert.isFalse(stubCurrentWin.calledOnce, 'not called current windows');
      assert.isFalse(stubConnect.called, 'not called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.isObject(res, 'result');
      assert.strictEqual(res.name, `${SIDEBAR}_1`, 'name');
    });
  });
});
