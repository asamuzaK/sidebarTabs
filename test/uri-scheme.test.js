/**
 * uri-scheme.test.js
 */

/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';

/* test */
import uriSchemes, * as mjs from '../src/mjs/uri-scheme.js';

describe('uri-scheme', () => {
  it('should get string', () => {
    assert.isArray(uriSchemes);
    for (const scheme of uriSchemes) {
      assert.isString(scheme);
      assert.isTrue(/^[a-z][a-z0-9+\-.]*$/.test(scheme));
    }
  });

  describe('is URI', () => {
    const func = mjs.isUri;

    it('should get false', () => {
      const res = func();
      assert.isFalse(res, 'result');
    });

    it('should get false', () => {
      const res = func('foo');
      assert.isFalse(res, 'result');
    });

    it('should get false', () => {
      const res = func('foo:bar');
      assert.isFalse(res, 'result');
    });

    it('should get true', () => {
      const res = func('https://example.com');
      assert.isTrue(res, 'result');
    });

    it('should get true', () => {
      const res = func('https://example.com:8000/#foo?bar=baz');
      assert.isTrue(res, 'result');
    });

    it('should get false', () => {
      const res = func('https://example.com foo');
      assert.isFalse(res, 'result');
    });

    it('should get true', () => {
      const res = func('https://127.0.0.1');
      assert.isTrue(res, 'result');
    });

    it('should get true', () => {
      const res = func('https://[::1]/');
      assert.isTrue(res, 'result');
    });

    it('should get true', () => {
      const res = func('file:///C:/Users/Foo/');
      assert.isTrue(res, 'result');
    });

    it('should get true', () => {
      const res = func('mailto:foo@example.com');
      assert.isTrue(res, 'result');
    });

    it('should get true', () => {
      const res = func('ext+foo://example.com/');
      assert.isTrue(res, 'result');
    });

    it('should get true', () => {
      const res = func('web+foo://example.com/');
      assert.isTrue(res, 'result');
    });

    it('should get true', () => {
      const res = func('git+https://example.com/');
      assert.isTrue(res, 'result');
    });

    it('should get false', () => {
      const res = func('foo+https://example.com/');
      assert.isFalse(res, 'result');
    });

    it('should get false', () => {
      const res = func('git+foo://example.com/');
      assert.isFalse(res, 'result');
    });
  });
});
