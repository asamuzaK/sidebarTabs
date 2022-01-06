/**
 * common.test.js
 */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { createJsdom } from './mocha/setup.js';
import sinon from 'sinon';

/* test */
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
      assert.isTrue(calledOnce);
      assert.isFalse(res);
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
      assert.isTrue(calledOnce);
      assert.isFalse(res);
    });
  });

  describe('throw error', () => {
    const func = mjs.throwErr;

    it('should throw', () => {
      const stub = sinon.stub(console, 'error');
      const i = stub.callCount;
      const e = new Error('error');
      assert.throws(() => func(e), 'error');
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
      const { calledOnce } = stub;
      stub.restore();
      assert.isUndefined(msg);
      assert.isFalse(calledOnce);
      assert.isFalse(res);
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
      assert.isTrue(calledOnce);
      assert.isFalse(res);
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
      const { calledOnce } = stub;
      stub.restore();
      assert.isUndefined(msg);
      assert.isFalse(calledOnce);
      assert.isUndefined(res);
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
      assert.isTrue(calledOnce);
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
        assert.isFalse(func(item));
      }
    });

    it('should get true', () => {
      const items = ['', 'foo'];
      for (const item of items) {
        assert.isTrue(func(item));
      }
    });
  });

  describe('is object, and not an empty object', () => {
    const func = mjs.isObjectNotEmpty;

    it('should get false', () => {
      const items = [{}, [], ['foo'], '', 'foo', undefined, null, 1, true];
      for (const item of items) {
        assert.isFalse(func(item));
      }
    });

    it('should get true', () => {
      const item = {
        foo: 'bar'
      };
      assert.isTrue(func(item));
    });
  });

  describe('stringify positive integer', () => {
    const func = mjs.stringifyPositiveInt;

    it('should get null if no argument given', () => {
      assert.isNull(func());
    });

    it('should get null if given argument exceeds max safe integer', () => {
      const i = Number.MAX_SAFE_INTEGER + 1;
      assert.isNull(func(i));
    });

    it('should get null if given argument is not positive integer', () => {
      assert.isNull(func(''));
    });

    it('should get null if given argument is not positive integer', () => {
      assert.isNull(func(-1));
    });

    it('should get null if 1st argument is 0 but 2nd argument is falsy', () => {
      assert.isNull(func(0));
    });

    it('should get string', () => {
      const i = 0;
      const res = func(i, true);
      assert.strictEqual(res, '0');
    });

    it('should get string', () => {
      const i = 1;
      const res = func(i);
      assert.strictEqual(res, '1');
    });
  });

  describe('parse stringified integer', () => {
    const func = mjs.parseStringifiedInt;

    it('should throw', () => {
      assert.throws(() => func(), 'Expected String but got Undefined.');
    });

    it('should throw', () => {
      assert.throws(() => func('foo'), 'foo is not a stringified integer.');
    });

    it('should throw', () => {
      assert.throws(() => func('01'), '01 is not a stringified integer.');
    });

    it('should get integer', () => {
      const i = '1';
      const res = func(i);
      assert.strictEqual(res, 1);
    });

    it('should get integer', () => {
      const i = '-1';
      const res = func(i);
      assert.strictEqual(res, -1);
    });

    it('should get integer', () => {
      const i = '01';
      const res = func(i, true);
      assert.strictEqual(res, 1);
    });

    it('should get integer', () => {
      const i = '-01';
      const res = func(i, true);
      assert.strictEqual(res, -1);
    });

    it('should get integer', () => {
      const i = '01a';
      const res = func(i, true);
      assert.strictEqual(res, 1);
    });
  });

  describe('escape all matching chars', () => {
    const func = mjs.escapeMatchingChars;

    it('should throw', () => {
      assert.throws(() => func(), 'Expected String but got Undefined.');
    });

    it('should throw', () => {
      assert.throws(() => func('foo', 'bar'),
        'Expected RegExp but got String.');
    });

    it('should get null', () => {
      const str = '[foo][bar][baz]';
      const re = /([[\]])/;
      const res = func(str, re);
      assert.isNull(res);
    });

    it('should get string', () => {
      const str = '[foo][bar][baz]';
      const re = /([[\]])/g;
      const res = func(str, re);
      assert.strictEqual(res, '\\[foo\\]\\[bar\\]\\[baz\\]');
    });
  });

  describe('is valid Toolkit version string', () => {
    const func = mjs.isValidToolkitVersion;

    it('should throw', () => {
      assert.throws(() => func(), 'Expected String but got Undefined.');
    });

    it('should get true', () => {
      const versions = [
        '0', '1', '10', '0.1', '1.0', '1.0.0', '1.0.0.0', '1.0.0a', '1.0.0a1',
        '1.0.0.0beta2', '3.1.2.65535', '4.1pre1', '4.1.1.2pre3',
        '0.1.12dev-cb31c51'
      ];
      for (const version of versions) {
        const res = func(version);
        assert.isTrue(res, version);
      }
    });

    it('should get false', () => {
      const versions = [
        '01', '1.0.01', '.', '.1', '1.', '65536', '1.0.0.65536',
        '1.0.0.0.0', '1.0.0-a', '1.0.0-0', '1.0.0+20130313144700',
        '123e5', '1.123e5', '1.a', 'a.b.c.d', '2.99999'
      ];
      for (const version of versions) {
        const res = func(version);
        assert.isFalse(res, version);
      }
    });
  });

  describe('parse version string', () => {
    const func = mjs.parseVersion;

    it('should throw', () => {
      assert.throws(() => func(), 'Expected String but got Undefined.');
    });

    it('should throw', () => {
      assert.throws(() => func('.1'), '.1 does not match toolkit format.');
    });

    it('should get object', () => {
      const version = '1.2.3';
      const res = func(version);
      assert.deepEqual(res, {
        version,
        major: 1,
        minor: 2,
        patch: 3,
        build: undefined,
        pre: undefined
      });
    });

    it('should get object', () => {
      const version = '1.2.3.4a1';
      const res = func(version);
      assert.deepEqual(res, {
        version,
        major: 1,
        minor: 2,
        patch: 3,
        build: 4,
        pre: ['a1']
      });
    });
  });

  describe('remove query string from URI', () => {
    const func = mjs.removeQueryFromURI;

    it('should get same value', () => {
      const res = func();
      assert.isUndefined(res);
    });

    it('should get same value', () => {
      const arg = [];
      const res = func(arg);
      assert.deepEqual(res, arg);
    });

    it('should get same value', () => {
      const arg = '';
      const res = func(arg);
      assert.strictEqual(res, arg);
    });

    it('should get same value', () => {
      const arg = 'foo/bar';
      const res = func(arg);
      assert.strictEqual(res, arg);
    });

    it('should get same value', () => {
      const arg = 'https://example.com';
      const res = func(arg);
      assert.strictEqual(res, arg);
    });

    it('should get query stripped', () => {
      const arg = 'https://example.com#foo?bar=baz';
      const res = func(arg);
      assert.strictEqual(res, 'https://example.com#foo');
    });

    it('should get query stripped', () => {
      const arg = 'https://example.com#foo?bar=baz%20qux';
      const res = func(arg);
      assert.strictEqual(res, 'https://example.com#foo');
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
      assert.isNull(res);
    });

    it('should get null if 1st argument is not positive integer', async () => {
      const res = await func(-1);
      assert.isNull(res);
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
      assert.isNull(res, 'result');
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
      assert.isTrue(res.hasAttribute('contenteditable'), 'attr');
      assert.isTrue(res.isContentEditable, 'editable');
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
      assert.isTrue(res.hasAttribute('contenteditable'), 'attr');
      assert.isTrue(res.isContentEditable, 'editable');
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
      assert.isTrue(res.hasAttribute('contenteditable'), 'attr');
      assert.isTrue(res.isContentEditable, 'editable');
      assert.isTrue(spy.calledOnce, 'called');
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
      assert.isNull(res, 'result');
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
      assert.isFalse(res.hasAttribute('contenteditable'), 'attr');
      assert.isFalse(res.isContentEditable, 'editable');
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
      assert.isUndefined(res, 'result');
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
