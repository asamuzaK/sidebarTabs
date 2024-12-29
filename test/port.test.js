/**
 * port.test.js
 */
/* eslint-disable import-x/order */

/* api */
import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import { browser, mockPort } from './mocha/setup.js';

/* test */
import * as mjs from '../src/mjs/port.js';
import { SIDEBAR } from '../src/mjs/constant.js';

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

  describe('ports', () => {
    assert.strictEqual(mjs.ports instanceof Map, true, 'instance');
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
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', async () => {
      mjs.ports.set('foo', {});
      const res = await func('bar');
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', async () => {
      mjs.ports.set('foo', {});
      const res = await func('foo');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.strictEqual(res, true, 'result');
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
      assert.strictEqual(errCalled, false, 'error called');
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
      assert.strictEqual(errCalled, true, 'error called');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.deepEqual(res, [true, false], 'result');
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
      assert.strictEqual(stubCurrentWin.calledOnce, true, 'called window');
      assert.strictEqual(stubConnect.called, false, 'not called connect');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.strictEqual(res, null, 'result');
    });

    it('should get port object', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      const res = await func();
      assert.strictEqual(stubCurrentWin.calledOnce, true, 'called window');
      assert.strictEqual(stubConnect.calledOnce, true, 'called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.strictEqual(res.name, `${SIDEBAR}_1`, 'name');
    });

    it('should get port object', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      const res = await func(`${SIDEBAR}_1`);
      assert.strictEqual(stubCurrentWin.calledOnce, true, 'called window');
      assert.strictEqual(stubConnect.calledOnce, true, 'called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
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
      assert.strictEqual(stubCurrentWin.calledOnce, true, 'called window');
      assert.strictEqual(stubConnect.called, false, 'not called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
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
      assert.strictEqual(stubCurrentWin.calledOnce, true, 'called window');
      assert.strictEqual(stubConnect.called, false, 'not called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
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
      assert.strictEqual(stubCurrentWin.called, false, 'not called window');
      assert.strictEqual(stubConnect.called, false, 'not called connect');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.strictEqual(res, null, 'result');
    });

    it('should get null', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_NONE
      });
      const stubConnect = browser.runtime.connect;
      const res = await func(`${SIDEBAR}_1`, true);
      assert.strictEqual(stubCurrentWin.calledOnce, true, 'called window');
      assert.strictEqual(stubConnect.called, false, 'not called connect');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.strictEqual(res, null, 'result');
    });

    it('should get null', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      const res = await func(`${SIDEBAR}_1`);
      assert.strictEqual(stubCurrentWin.called, false, 'not called window');
      assert.strictEqual(stubConnect.called, false, 'not called connect');
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.strictEqual(res, null, 'result');
    });

    it('should get port object', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1
      });
      const stubConnect = browser.runtime.connect;
      const res = await func(`${SIDEBAR}_1`, true);
      assert.strictEqual(stubCurrentWin.calledOnce, true, 'called window');
      assert.strictEqual(stubConnect.calledOnce, true, 'called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
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
      assert.strictEqual(stubCurrentWin.called, false, 'not called window');
      assert.strictEqual(stubConnect.called, false, 'not called connect');
      assert.strictEqual(mjs.ports.size, 1, 'size');
      assert.strictEqual(res.name, `${SIDEBAR}_1`, 'name');
    });
  });
});
