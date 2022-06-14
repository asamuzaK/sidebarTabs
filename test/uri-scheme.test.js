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
    assert.isArray(uriSchemes);
    for (const scheme of uriSchemes) {
      assert.isString(scheme);
      assert.isTrue(/^[a-z][a-z0-9+\-.]*$/.test(scheme));
    }
  });
});
