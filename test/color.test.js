/**
 * color.test.js
 */

/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';
import { resolve } from '@asamuzakjp/css-color';

/* test */
import * as mjs from '../src/mjs/color.js';

describe('color', () => {
  describe('convert rgb to hex color', () => {
    const func = mjs.convertRgbToHex;

    it('should throw', () => {
      assert.throws(() => func(), TypeError,
        'Expected Array but got Undefined.');
    });

    it('should throw', () => {
      assert.throws(() => func([]), Error);
    });

    it('should get value', () => {
      const res = func([255, 0, 128]);
      assert.deepEqual(res, '#ff0080', 'result');
    });

    it('should get value', () => {
      const res = func([255, 0, 128, 1]);
      assert.deepEqual(res, '#ff0080', 'result');
    });

    it('should get value', () => {
      const res = func([0, 0, 0, 1]);
      assert.deepEqual(res, '#000000', 'result');
    });

    it('should get value', () => {
      const res = func([255, 255, 255, 1]);
      assert.deepEqual(res, '#ffffff', 'result');
    });

    it('should get value', () => {
      const res = func([1, 35, 69, 0.40392]);
      assert.deepEqual(res, '#01234567', 'result');
    });

    it('should get value', () => {
      const res = func([137, 171, 205, 0.93725]);
      assert.deepEqual(res, '#89abcdef', 'result');
    });
  });

  describe('get color in hexadecimal color syntax', () => {
    const func = mjs.getColorInHex;

    it('should throw', () => {
      assert.throws(() => func(), TypeError,
        'Expected String but got Undefined.');
    });

    it('should get null', () => {
      const res = func('transparent');
      assert.isNull(res, 'result');
    });

    it('should get value', () => {
      const res = func('green');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', () => {
      const res = func(' GREEN ');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', () => {
      const res = func('rgba(0% 50% 0% / 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, '#00800080', 'result');
    });

    it('should get value', () => {
      const res = func('color-mix(in srgb, blue, red)');
      const value = resolve('rgb(128, 0, 128)', {
        format: 'hex'
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get array', () => {
      const res = func('color-mix(in srgb, blue, red)', {
        alpha: true,
        property: 'foo'
      });
      const value = resolve('rgb(128, 0, 128)', {
        format: 'hex'
      });
      assert.deepEqual(res, ['foo', value], 'result');
    });

    it('should get value', () => {
      const res = func('color(srgb 0 0.5 0)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', () => {
      const res = func('currentColor', {
        currentColor: 'green'
      });
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', () => {
      const res = func('currentColor', {
        alpha: true,
        currentColor: 'color(srgb 0 0.5 0 / 0.5)'
      });
      assert.strictEqual(res, '#00800080', 'result');
    });

    it('should get value', () => {
      const res = func('currentColor', {
        currentColor: 'color-mix(in srgb, blue, red)'
      });
      assert.strictEqual(res, '#800080', 'result');
    });

    it('should get value', () => {
      const res = func('currentColor', {
        alpha: true
      });
      assert.strictEqual(res, null, 'result');
    });

    it('should get value', () => {
      const res = func('currentColor');
      assert.strictEqual(res, null, 'result');
    });
  });

  describe('composite two layered colors', () => {
    const func = mjs.compositeLayeredColors;

    it('should throw', () => {
      assert.throws(() => func(), TypeError,
        'Expected String but got Undefined.');
    });

    it('should throw', () => {
      assert.throws(() => func('foo'), TypeError,
        'Expected String but got Undefined.');
    });

    it('should get transparent', () => {
      const res = func('foo', 'bar');
      assert.strictEqual(res, '#00000000', 'result');
    });

    it('should get black', () => {
      const res = func('foo', 'black');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get black', () => {
      const res = func('black', 'foo');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', () => {
      const res = func('#00000000', 'black');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', () => {
      const res = func('#ff0000', 'black');
      assert.strictEqual(res, '#ff0000', 'result');
    });

    it('should get value', () => {
      const res = func('#ff000000', '#0000ff00');
      assert.strictEqual(res, '#0000ff00', 'result');
    });

    it('should get value', () => {
      const res = func('#0000ff11', '#0000ff');
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get value', () => {
      const res = func('#ffffff11', '#000000');
      assert.strictEqual(res, '#111111', 'result');
    });

    it('should get value', () => {
      const res = func('#ffffff22', '#000000');
      assert.strictEqual(res, '#222222', 'result');
    });

    it('should get value', () => {
      const res = func('#ffffff33', '#000000');
      assert.strictEqual(res, '#333333', 'result');
    });

    it('should get value', () => {
      const res = func('#ffffff66', '#000000');
      assert.strictEqual(res, '#666666', 'result');
    });

    it('should get value', () => {
      const res = func('#ffffff99', '#000000');
      assert.strictEqual(res, '#999999', 'result');
    });

    it('should get value', () => {
      const res = func('#ffffffcc', '#000000');
      assert.strictEqual(res, '#cccccc', 'result');
    });

    it('should get value', () => {
      const res = func('#0c0c0d1a', '#0a84ff');
      assert.strictEqual(res, '#0a78e7', 'result');
    });

    it('should get value', () => {
      const res = func('#d7d7db1a', '#0a84ff');
      assert.strictEqual(res, '#1f8cfb', 'result');
    });

    it('should get value', () => {
      const res = func('#d7d7db33', '#0a84ff');
      assert.strictEqual(res, '#3395f8', 'result');
    });

    it('should get value', () => {
      const res = func('#f9f9fa1a', '#0a84ff');
      assert.strictEqual(res, '#2290ff', 'result');
    });

    it('should get value', () => {
      const res = func('#2a2a2e1a', '#0a84ff');
      assert.strictEqual(res, '#0d7bea', 'result');
    });

    it('should get value', () => {
      const res = func('#2a2a2e33', '#0a84ff');
      assert.strictEqual(res, '#1072d5', 'result');
    });

    it('should get value', () => {
      const res = func('#ffffff11', '#000000ee');
      assert.strictEqual(res, '#121212ef', 'result');
    });

    it('should get value', () => {
      const res = func('#66669999', '#15141a');
      assert.strictEqual(res, '#464566', 'result');
    });

    it('should get value', () => {
      const res = func('#cc663399', '#15141a');
      assert.strictEqual(res, '#834529', 'result');
    });

    it('should get value', () => {
      const res = func('#33996699', '#15141a');
      assert.strictEqual(res, '#276448', 'result');
    });

    it('should get value', () => {
      const res = func('#cc669999', '#15141a');
      assert.strictEqual(res, '#834566', 'result');
    });

    it('should get value', () => {
      const res = func('#6699cc99', '#15141a');
      assert.strictEqual(res, '#466485', 'result');
    });

    it('should get value', () => {
      const res = func('#66669999', '#f9f9fa');
      assert.strictEqual(res, '#a1a1c0', 'result');
    });

    it('should get value', () => {
      const res = func('#cc663399', '#f9f9fa');
      assert.strictEqual(res, '#dea183', 'result');
    });

    it('should get value', () => {
      const res = func('#33996699', '#f9f9fa');
      assert.strictEqual(res, '#82bfa1', 'result');
    });

    it('should get value', () => {
      const res = func('#cc669999', '#f9f9fa');
      assert.strictEqual(res, '#dea1c0', 'result');
    });

    it('should get value', () => {
      const res = func('#6699cc99', '#f9f9fa');
      assert.strictEqual(res, '#a1bfde', 'result');
    });

    it('should get value', () => {
      const res = func('#6699cc66', '#6699cc99');
      assert.strictEqual(res, '#6699ccc2', 'result');
    });

    it('should get value', () => {
      const res = func('#6699cc99', '#6699cc66');
      assert.strictEqual(res, '#6699ccc2', 'result');
    });

    it('should get value', () => {
      const overlay = 'color(srgb 0 0.5 0 / 0.4)';
      const base = 'color-mix(in srgb, white, blue)';
      const res = func(overlay, base);
      assert.strictEqual(res, '#4d8099', 'result');
    });

    // active tab border mixed color of the default theme
    it('should get value', () => {
      const res = func('rgba(128,128,142,0.4)', '#fff');
      assert.strictEqual(res, '#ccccd2', 'result');
    });
  });
});
