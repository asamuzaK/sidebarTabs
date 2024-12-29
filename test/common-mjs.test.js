/**
 * common.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import { createJsdom } from './mocha/setup.js';

/* test */
// eslint-disable-next-line import-x/order
import * as mjs from '../src/mjs/common.js';

describe('common', () => {
  let window, document;
  // NOTE: not implemented in jsdom https://github.com/jsdom/jsdom/issues/1670
  const isContentEditable = elm => {
    let bool;
    if (elm.hasAttribute('contenteditable')) {
      const attr = elm.getAttribute('contenteditable');
      if (attr === 'true' || attr === '') {
        bool = true;
      } else if (attr === 'false') {
        bool = false;
      }
    }
    if (document && document.designMode === 'on') {
      bool = true;
    }
    return !!bool;
  };
  beforeEach(() => {
    const dom = createJsdom();
    window = dom && dom.window;
    document = window && window.document;
    global.window = window;
    global.document = document;
  });
  afterEach(() => {
    window = null;
    document = null;
    delete global.window;
    delete global.document;
  });

  describe('log error', () => {
    const func = mjs.logErr;

    it('should log error message', () => {
      let msg;
      const stub = sinon.stub(console, 'error').callsFake(m => {
        msg = (m && m.message) || m;
      });
      const e = new Error('error');
      const res = func(e);
      const { calledOnce } = stub;
      stub.restore();
      assert.strictEqual(msg, 'error');
      assert.strictEqual(calledOnce, true);
      assert.strictEqual(res, false);
    });

    it('should log error message', () => {
      let msg;
      const stub = sinon.stub(console, 'error').callsFake(m => {
        msg = (m && m.message) || m;
      });
      const e = 'error';
      const res = func(e);
      const { calledOnce } = stub;
      stub.restore();
      assert.strictEqual(msg, 'error');
      assert.strictEqual(calledOnce, true);
      assert.strictEqual(res, false);
    });
  });

  describe('throw error', () => {
    const func = mjs.throwErr;

    it('should throw', () => {
      const stub = sinon.stub(console, 'error');
      const i = stub.callCount;
      const e = new Error('error');
      assert.throws(() => func(e), Error, 'error');
      assert.strictEqual(stub.callCount, i + 1, 'called');
      stub.restore();
    });
  });

  describe('log warn', () => {
    const func = mjs.logWarn;

    it('should not log warn message if argument is falsy', () => {
      let msg;
      const stub = sinon.stub(console, 'warn').callsFake(m => {
        msg = m;
      });
      const res = func();
      const { called } = stub;
      stub.restore();
      assert.strictEqual(msg, undefined);
      assert.strictEqual(called, false);
      assert.strictEqual(res, false);
    });

    it('should log warn message', () => {
      let msg;
      const stub = sinon.stub(console, 'warn').callsFake(m => {
        msg = m;
      });
      const res = func('foo');
      const { calledOnce } = stub;
      stub.restore();
      assert.strictEqual(msg, 'foo');
      assert.strictEqual(calledOnce, true);
      assert.strictEqual(res, false);
    });
  });

  describe('log message', () => {
    const func = mjs.logMsg;

    it('should not log message if argument is falsy', () => {
      let msg;
      const stub = sinon.stub(console, 'log').callsFake(m => {
        msg = m;
      });
      const res = func();
      const { called } = stub;
      stub.restore();
      assert.strictEqual(msg, undefined);
      assert.strictEqual(called, false);
      assert.strictEqual(res, undefined);
    });

    it('should log message', () => {
      let msg;
      const stub = sinon.stub(console, 'log').callsFake(m => {
        msg = m;
      });
      const res = func('foo');
      const { calledOnce } = stub;
      stub.restore();
      assert.strictEqual(msg, 'foo');
      assert.strictEqual(calledOnce, true);
      assert.strictEqual(res, msg);
    });
  });

  describe('get type', () => {
    const func = mjs.getType;

    it('should get Array', () => {
      const res = func([]);
      assert.deepEqual(res, 'Array');
    });

    it('should get Object', () => {
      const res = func({});
      assert.deepEqual(res, 'Object');
    });

    it('should get String', () => {
      const res = func('');
      assert.deepEqual(res, 'String');
    });

    it('should get Number', () => {
      const res = func(1);
      assert.deepEqual(res, 'Number');
    });

    it('should get Boolean', () => {
      const res = func(true);
      assert.deepEqual(res, 'Boolean');
    });

    it('should get Undefined', () => {
      const res = func();
      assert.deepEqual(res, 'Undefined');
    });

    it('should get Null', () => {
      const res = func(null);
      assert.deepEqual(res, 'Null');
    });
  });

  describe('is string', () => {
    const func = mjs.isString;

    it('should get false', () => {
      const items = [[], ['foo'], {}, { foo: 'bar' }, undefined, null, 1, true];
      for (const item of items) {
        assert.strictEqual(func(item), false);
      }
    });

    it('should get true', () => {
      const items = ['', 'foo'];
      for (const item of items) {
        assert.strictEqual(func(item), true);
      }
    });
  });

  describe('is object, and not an empty object', () => {
    const func = mjs.isObjectNotEmpty;

    it('should get false', () => {
      const items = [{}, [], ['foo'], '', 'foo', undefined, null, 1, true];
      for (const item of items) {
        assert.strictEqual(func(item), false);
      }
    });

    it('should get true', () => {
      const item = {
        foo: 'bar'
      };
      assert.strictEqual(func(item), true);
    });
  });

  describe('sleep', () => {
    const func = mjs.sleep;

    it('should resolve even if no argument given', async () => {
      const fake = sinon.fake();
      const fake2 = sinon.fake();
      await func().then(fake).catch(fake2);
      assert.strictEqual(fake.callCount, 1);
      assert.strictEqual(fake2.callCount, 0);
    });

    it('should get null if 1st argument is not integer', async () => {
      const res = await func('foo');
      assert.strictEqual(res, null);
    });

    it('should get null if 1st argument is not positive integer', async () => {
      const res = await func(-1);
      assert.strictEqual(res, null);
    });

    it('should resolve', async () => {
      const fake = sinon.fake();
      const fake2 = sinon.fake();
      await func(1).then(fake).catch(fake2);
      assert.strictEqual(fake.callCount, 1);
      assert.strictEqual(fake2.callCount, 0);
    });

    it('should reject', async () => {
      const fake = sinon.fake();
      const fake2 = sinon.fake();
      await func(1, true).then(fake).catch(fake2);
      assert.strictEqual(fake.callCount, 0);
      assert.strictEqual(fake2.callCount, 1);
    });
  });

  describe('add contenteditable attribute to element', () => {
    const func = mjs.addElementContentEditable;
    const globalKeys = ['Node'];
    beforeEach(() => {
      for (const key of globalKeys) {
        global[key] = window[key];
      }
    });
    afterEach(() => {
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get null', () => {
      const res = func();
      assert.strictEqual(res, null, 'result');
    });

    it('should set contenteditable and get element', () => {
      const p = document.createElement('p');
      const body = document.querySelector('body');
      p.id = 'foo';
      body.appendChild(p);
      const res = func(p);
      if (typeof p.isContentEditable !== 'boolean') {
        p.isContentEditable = isContentEditable(p);
      }
      assert.strictEqual(res.hasAttribute('contenteditable'), true, 'attr');
      assert.strictEqual(res.isContentEditable, true, 'editable');
      assert.strictEqual(res.id, 'foo', 'result');
    });

    it('should set contenteditable and get element', () => {
      const p = document.createElement('p');
      const body = document.querySelector('body');
      p.id = 'foo';
      body.appendChild(p);
      const res = func(p);
      if (typeof p.isContentEditable !== 'boolean') {
        p.isContentEditable = isContentEditable(p);
      }
      assert.strictEqual(res.hasAttribute('contenteditable'), true, 'attr');
      assert.strictEqual(res.isContentEditable, true, 'editable');
      assert.strictEqual(res.id, 'foo', 'result');
    });

    it('should set contenteditable, call function and get element', () => {
      const p = document.createElement('p');
      const body = document.querySelector('body');
      p.id = 'foo';
      const spy = sinon.spy(p, 'focus');
      body.appendChild(p);
      const res = func(p, true);
      if (typeof p.isContentEditable !== 'boolean') {
        p.isContentEditable = isContentEditable(p);
      }
      assert.strictEqual(res.hasAttribute('contenteditable'), true, 'attr');
      assert.strictEqual(res.isContentEditable, true, 'editable');
      assert.strictEqual(spy.calledOnce, true, 'called');
      assert.strictEqual(res.id, 'foo', 'result');
    });
  });

  describe('remove contenteditable attribute from element', () => {
    const func = mjs.removeElementContentEditable;
    const globalKeys = ['Node'];
    beforeEach(() => {
      for (const key of globalKeys) {
        global[key] = window[key];
      }
    });
    afterEach(() => {
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get null', () => {
      const res = func();
      assert.strictEqual(res, null, 'result');
    });

    it('should remove contenteditable and get element', () => {
      const p = document.createElement('p');
      const body = document.querySelector('body');
      p.id = 'foo';
      p.setAttribute('contenteditable', 'true');
      body.appendChild(p);
      const res = func(p);
      if (typeof p.isContentEditable !== 'boolean') {
        p.isContentEditable = isContentEditable(p);
      }
      assert.strictEqual(res.hasAttribute('contenteditable'), false, 'attr');
      assert.strictEqual(res.isContentEditable, false, 'editable');
      assert.strictEqual(res.id, 'foo', 'result');
    });
  });

  describe('set element dataset', () => {
    const func = mjs.setElementDataset;
    const globalKeys = ['Node'];
    beforeEach(() => {
      for (const key of globalKeys) {
        global[key] = window[key];
      }
    });
    afterEach(() => {
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get undefined', async () => {
      const res = await func();
      assert.strictEqual(res, undefined, 'result');
    });

    it('should set dataset and get element', async () => {
      const p = document.createElement('p');
      p.id = 'foo';
      const body = document.querySelector('body');
      body.appendChild(p);
      const res = await func(p, 'bar', 'baz');
      assert.strictEqual(p.dataset.bar, 'baz', 'dataset');
      assert.strictEqual(res.id, 'foo', 'result');
    });
  });
});
