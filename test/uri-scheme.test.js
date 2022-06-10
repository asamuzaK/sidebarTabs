/**
 * uri-scheme.test.js
 */

/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';

/* test */
import uriSchemes from '../src/mjs/uri-scheme.js';

describe('uri-scheme', () => {
  it('should get string', () => {
    const items = Object.keys(uriSchemes);
    assert.isArray(uriSchemes);
    for (const key of items) {
      assert.isString(key);
    }
  });
});
