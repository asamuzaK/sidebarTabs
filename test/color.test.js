/**
 * color.test.js
 */

/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';

/* test */
import * as mjs from '../src/mjs/color.js';

describe('color', () => {
  describe('colorname', () => {
    const obj = mjs.colorname;

    it('should get string', async () => {
      const items = Object.keys(obj);
      for (const key of items) {
        assert.isString(obj[key], 'value');
      }
    });
  });

  describe('validate color components', () => {
    const func = mjs.validateColorComponents;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Expected array length of 3 or 4 but got 0.', 'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, 1], {
        maxLength: 3
      }).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Expected array length of 3 but got 4.', 'error message');
      });
    });

    it('should throw', async () => {
      await func(['foo', 1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([NaN, 1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.', 'error message');
      });
    });

    it('should throw', async () => {
      await func([-1, 1, 1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1.1, 1, 1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '1.1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, 'foo']).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, NaN]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.', 'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, -1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, 1.1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '1.1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, 128, 256, 1], {
        maxRange: 255
      }).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '256 is not between 0 and 255.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, -128, 192, 1], {
        maxRange: 255
      }).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-128 is not between 0 and 255.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, 128, 192, 1.1], {
        maxRange: 255
      }).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '1.1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, 128, 192, 1], {
        minLength: null
      }).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Null.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, 128, 192, 1], {
        minLength: NaN
      }).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, 128, 192, 1], {
        maxLength: null
      }).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Null.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, 128, 192, 1], {
        maxLength: NaN
      }).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, 128, 192, 1], {
        minRange: null
      }).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Null.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, 128, 192, 1], {
        minRange: NaN
      }).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, 128, 192, 1], {
        maxRange: null
      }).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Null.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([0, 128, 192, 1], {
        maxRange: NaN
      }).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func([1, 0.3, 0.7, 0.5]);
      assert.deepEqual(res, [1, 0.3, 0.7, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func([1, 0.3, 0.7]);
      assert.deepEqual(res, [1, 0.3, 0.7], 'result');
    });

    it('should get value', async () => {
      const res = await func([1, -1, 1.1, 0.5], {
        validateRange: false
      });
      assert.deepEqual(res, [1, -1, 1.1, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func([1, -1, 1.1], {
        maxLength: 3,
        validateRange: false
      });
      assert.deepEqual(res, [1, -1, 1.1], 'result');
    });

    it('should get value', async () => {
      const res = await func([1, 0.3, 0.7]);
      assert.deepEqual(res, [1, 0.3, 0.7], 'result');
    });

    it('should get value', async () => {
      const res = await func([1, 0.3, 0.7], {
        alpha: true
      });
      assert.deepEqual(res, [1, 0.3, 0.7, 1], 'result');
    });
  });

  describe('transform matrix', () => {
    const func = mjs.transformMatrix;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 3 but got 0.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func(['foo', [], []]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([[], [], []]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 3 but got 0.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([[1, 0, 'foo'], [], []]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([[1, 0, NaN], [], []]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.', 'error message');
      });
    });

    it('should throw', async () => {
      await func([[1, 0, 0], [0, 1, 0], [0, 0, 1]]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([[1, 0, 0], [0, 1, 0], [0, 0, 1]], []).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 3 but got 0.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 0, 'foo']).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 0, NaN]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.', 'error message');
      });
    });

    it('should get value', async () => {
      const res = await func([[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 0, 0.5]);
      assert.deepEqual(res, [1, 0, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func([[0, 0, 1], [0, 1, 0], [1, 0, 0]], [1, 0, 0.5]);
      assert.deepEqual(res, [0.5, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func([[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 0.5, 0]);
      assert.deepEqual(res, [1, 0.5, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func([[0, 0, 1], [0, 1, 0], [1, 0, 0]], [0, 0.5, 1]);
      assert.deepEqual(res, [1, 0.5, 0], 'result');
    });
  });

  describe('number to hex string', () => {
    const func = mjs.numberToHexString;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func(Number.NaN).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.', 'error message');
      });
    });

    it('should throw', async () => {
      await func(-1).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-1 is not between 0 and 255.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func(256).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '256 is not between 0 and 255.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func(-0.5).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '256 is not between 0 and 255.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func(255.5).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '256 is not between 0 and 255.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func(-0.4);
      assert.strictEqual(res, '00', 'result');
    });

    it('should get value', async () => {
      const res = await func(255.4);
      assert.strictEqual(res, 'ff', 'result');
    });

    it('should get value', async () => {
      const res = await func(0);
      assert.strictEqual(res, '00', 'result');
    });

    it('should get value', async () => {
      const res = await func(9);
      assert.strictEqual(res, '09', 'result');
    });

    it('should get value', async () => {
      const res = await func(10);
      assert.strictEqual(res, '0a', 'result');
    });

    it('should get value', async () => {
      const res = await func(15);
      assert.strictEqual(res, '0f', 'result');
    });

    it('should get value', async () => {
      const res = await func(16);
      assert.strictEqual(res, '10', 'result');
    });

    it('should get value', async () => {
      const res = await func(17);
      assert.strictEqual(res, '11', 'result');
    });

    it('should get value', async () => {
      const res = await func(0.15 * 255);
      assert.strictEqual(res, '26', 'result');
    });

    it('should get value', async () => {
      const res = await func(255);
      assert.strictEqual(res, 'ff', 'result');
    });
  });

  describe('angle to deg', () => {
    const func = mjs.angleToDeg;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('0foo').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Invalid property value: 0foo',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('.').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Invalid property value: .',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('.0');
      assert.strictEqual(res, 0, 'result');
    });

    it('should get value', async () => {
      const res = await func('0.');
      assert.strictEqual(res, 0, 'result');
    });
    it('should get value', async () => {
      const res = await func('90');
      assert.strictEqual(res, 90, 'result');
    });

    it('should get value', async () => {
      const res = await func('90deg');
      assert.strictEqual(res, 90, 'result');
    });

    it('should get value', async () => {
      const res = await func('100grad');
      assert.strictEqual(res, 90, 'result');
    });

    it('should get value', async () => {
      const res = await func('.25turn');
      assert.strictEqual(res, 90, 'result');
    });

    it('should get value', async () => {
      const res = await func('1.57rad');
      assert.strictEqual(Math.round(res), 90, 'result');
    });

    it('should get value', async () => {
      const res = await func('0deg');
      assert.strictEqual(res, 0, 'result');
    });

    it('should get value', async () => {
      const res = await func('360deg');
      assert.strictEqual(res, 0, 'result');
    });

    it('should get value', async () => {
      const res = await func('540deg');
      assert.strictEqual(res, 180, 'result');
    });

    it('should get value', async () => {
      const res = await func('720deg');
      assert.strictEqual(res, 0, 'result');
    });

    it('should get value', async () => {
      const res = await func('-90deg');
      assert.strictEqual(res, 270, 'result');
    });

    it('should get value', async () => {
      const res = await func('-180deg');
      assert.strictEqual(res, 180, 'result');
    });

    it('should get value', async () => {
      const res = await func('-270deg');
      assert.strictEqual(res, 90, 'result');
    });

    it('should get value', async () => {
      const res = await func('-360deg');
      assert.strictEqual(res, 0, 'result');
    });

    it('should get value', async () => {
      const res = await func('-540deg');
      assert.strictEqual(res, 180, 'result');
    });

    it('should get value', async () => {
      const res = await func('-720deg');
      assert.strictEqual(res, 0, 'result');
    });
  });

  describe('rgb to linear rgb', () => {
    const func = mjs.rgbToLinearRgb;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, 1]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 3 but got 4.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func([1, 0, 0]);
      assert.deepEqual(res, [1, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0.5, 0]);
      res[1] = parseFloat(res[1].toFixed(5));
      assert.deepEqual(res, [0, 0.21404, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0, 0]);
      assert.deepEqual(res, [0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func([1, 1, 1]);
      assert.deepEqual(res, [1, 1, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func([0.0405, 0.0405, 0.0405]);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.00313, 0.00313, 0.00313], 'result');
    });

    it('should get value', async () => {
      const res = await func([0.0406, 0.0406, 0.0406]);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.00314, 0.00314, 0.00314], 'result');
    });
  });

  describe('linear rgb to rgb', () => {
    const func = mjs.linearRgbToRgb;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, 1]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 3 but got 4.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func([1, 0, 0]);
      res[0] = parseFloat(res[0].toFixed(5));
      assert.deepEqual(res, [1, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0.21404, 0]);
      res[1] = parseFloat(res[1].toFixed(5));
      assert.deepEqual(res, [0, 0.5, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0, 0]);
      assert.deepEqual(res, [0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func([1, 1, 1]);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [1, 1, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func([0.00313, 0.00313, 0.00313]);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.0404, 0.0404, 0.0404], 'result');
    });

    it('should get value', async () => {
      const res = await func([0.00314, 0.00314, 0.00314]);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.0406, 0.0406, 0.0406], 'result');
    });
  });

  describe('rgb to xyz', () => {
    const func = mjs.rgbToXyz;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Expected array length of 3 or 4 but got 0.', 'error message');
      });
    });

    it('should throw', async () => {
      await func(['foo', 1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([NaN, 1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.', 'error message');
      });
    });

    it('should throw', async () => {
      await func([-1, 1, 1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1.1, 1, 1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '1.1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, 'foo']).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, NaN]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.', 'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, -1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, 1.1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '1.1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func([1, 0, 0, 0.5]);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.41239, 0.21264, 0.01933, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0.50196, 0]);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0, 0, 1]);
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func([1, 1, 1, 1]);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.95046, 1, 1.08906, 1], 'result');
    });
  });

  describe('xyz to rgb', () => {
    const func = mjs.xyzToRgb;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func([0.41239, 0.21264, 0.01933, 0.5]);
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [1, 0, 0, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func([0.07719, 0.15438, 0.02573, 1]);
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [0, 0.502, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0, 0, 1]);
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func([0.95046, 1, 1.08906, 1]);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [1, 1, 1, 1], 'result');
    });
  });

  describe('xyz to hsl', () => {
    const func = mjs.xyzToHsl;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#ffffff');
      const res = await func(xyz);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, ['none', 'none', 100, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#000000');
      const res = await func(xyz);
      assert.deepEqual(res, ['none', 'none', 0, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#808080');
      const res = await func(xyz);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, ['none', 0, 50, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#ff0000');
      const res = await func(xyz);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [360, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#00ff00');
      const res = await func(xyz);
      res[0] = Math.round(res[0]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [120, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#0000ff');
      const res = await func(xyz);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [240, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#ff00ff');
      const res = await func(xyz);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [300, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#ffff00');
      const res = await func(xyz);
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [60, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#00ffff');
      const res = await func(xyz);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [180, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#008000');
      const res = await func(xyz);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [120, 100, 25, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#12345666');
      const res = await func(xyz);
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [210, 65, 20, 0.4]);
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#545c3d');
      const res = await func(xyz);
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [75, 20, 30, 1], 'result');
    });
  });

  describe('xyz to hwb', () => {
    const func = mjs.xyzToHwb;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#ffffff');
      const res = await func(xyz);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, ['none', 100, 0, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#000000');
      const res = await func(xyz);
      assert.deepEqual(res, ['none', 0, 100, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#808080');
      const res = await func(xyz);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, ['none', 50, 50, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#408000');
      const res = await func(xyz);
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [90, 0, 50, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#608040');
      const res = await func(xyz);
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [90, 25, 50, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#bfff80');
      const res = await func(xyz);
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [90, 50, 0, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#9fbf80');
      const res = await func(xyz);
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [90, 50, 25, 1], 'result');
    });
  });

  describe('xyz-d50 to lab', () => {
    const func = mjs.xyzD50ToLab;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#008000', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(1));
      assert.deepEqual(res, [46.278, -47.6, 48.6, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#000000', true);
      const res = await func(xyz);
      assert.deepEqual(res, [0, 'none', 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#ffffff', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      assert.deepEqual(res, [100, 'none', 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz =
        await mjs.parseColor('rgb(75.6208% 30.4487% 47.5634%)', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = Math.abs(parseFloat(res[2].toFixed(2)));
      assert.deepEqual(res, [50, 50, 0, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(10.751% 75.558% 66.398%)', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      assert.deepEqual(res, [70, -45, 0, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(76.6254% 66.3607% 5.5775%)', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      assert.deepEqual(res, [70, 0, 70, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(12.8128% 53.105% 92.7645%)', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = Math.abs(parseFloat(res[1].toFixed(2)));
      res[2] = parseFloat(res[2].toFixed(2));
      assert.deepEqual(res, [55, 0, -60, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(12.8128% 53.105% 92.7645% / 0.4)', {
        alpha: true
      });
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = Math.abs(parseFloat(res[1].toFixed(2)));
      res[2] = parseFloat(res[2].toFixed(2));
      assert.deepEqual(res, [55, 0, -60, 0.4], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#7654cd', {
        alpha: true
      });
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      assert.deepEqual(res, [44.36, 36.05, -58.99, 1], 'result');
    });
  });

  describe('xyz-d50 to lch', () => {
    const func = mjs.xyzD50ToLch;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#008000', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [46.27771, 67.98426, 134.38386, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#000000', true);
      const res = await func(xyz);
      assert.deepEqual(res, [0, 'none', 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#ffffff', true);
      const res = await func(xyz);
      assert.deepEqual(res, [100, 'none', 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#808080', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      assert.deepEqual(res, [53.585, 0, 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#010101', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      assert.deepEqual(res, [0.274, 0, 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#fefefe', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      assert.deepEqual(res, [99.6549, 0, 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(75.6208% 30.4487% 47.5634%)', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(0));
      res[1] = parseFloat(res[1].toFixed(0));
      res[2] = parseFloat(res[2].toFixed(0));
      assert.deepEqual(res, [50, 50, 360, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(10.7906% 75.5567% 66.3982%)', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(0));
      res[1] = parseFloat(res[1].toFixed(0));
      res[2] = parseFloat(res[2].toFixed(0));
      assert.deepEqual(res, [70, 45, 180, 1], 'result');
    });

    it('should get value', async () => {
      const xyz =
        await mjs.parseColor('rgb(76.6254% 66.3607% 5.5775%)', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(0));
      res[1] = parseFloat(res[1].toFixed(0));
      res[2] = parseFloat(res[2].toFixed(0));
      assert.deepEqual(res, [70, 70, 90, 1], 'result');
    });

    it('should get value', async () => {
      const xyz =
        await mjs.parseColor('rgb(12.8128% 53.105% 92.7645%)', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(0));
      res[1] = parseFloat(res[1].toFixed(0));
      res[2] = parseFloat(res[2].toFixed(0));
      assert.deepEqual(res, [55, 60, 270, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#7654cd', true);
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [44.358, 69.129, 301.43, 1], 'result');
    });
  });

  describe('xyz to oklab', () => {
    const func = mjs.xyzToOklab;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#008000');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.51975, -0.1403, 0.10768, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#000000');
      const res = await func(xyz);
      assert.deepEqual(res, [0, 'none', 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#ffffff');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      assert.deepEqual(res, [1, 'none', 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(48.477% 34.29% 38.412%)');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.5, 0.05, 0, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(29.264% 70.096% 63.017%)');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = Math.abs(parseFloat(res[2].toFixed(3)));
      assert.deepEqual(res, [0.7, -0.1, 0, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(73.942% 60.484% 19.65%)');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = Math.abs(parseFloat(res[1].toFixed(5)));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.7, 0, 0.125, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(27.888% 38.072% 89.414%)');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = Math.abs(parseFloat(res[1].toFixed(5)));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.55, 0, -0.2, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.hexToXyz('#7654cd');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [0.544, 0.068, -0.166, 1], 'result');
    });
  });

  describe('xyz to oklch', () => {
    const func = mjs.xyzToOklch;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#008000');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.52, 0.18, 142.4953, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#000000');
      const res = await func(xyz);
      assert.deepEqual(res, [0, 'none', 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#ffffff');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(4));
      assert.deepEqual(res, [1, 'none', 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#808080');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(5));
      assert.deepEqual(res, [0.6, 0, 'none', 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(70.492% 2.351% 37.073%)');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [0.5, 0.2, 0, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(23.056% 31.73% 82.628%)');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [0.5, 0.2, 270, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(32.022% 85.805% 61.147%)');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [0.8, 0.15, 160, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('rgb(67.293% 27.791% 52.28%)');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [0.55, 0.15, 345, 1], 'result');
    });

    it('should get value', async () => {
      const xyz = await mjs.parseColor('#7654cd');
      const res = await func(xyz);
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [0.544, 0.179, 292.365, 1], 'result');
    });
  });

  describe('hex to rgb', () => {
    const func = mjs.hexToRgb;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('white').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: white',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('#1').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: #1',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('#12').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: #12',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('#12345').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: #12345',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('#1234567').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: #1234567',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('#123456789').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: #123456789',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('#ff0000');
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#FF0000');
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ff0000ff');
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#FF0000FF');
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ff00001a');
      res[3] = parseFloat(res[3].toFixed(1));
      assert.deepEqual(res, [255, 0, 0, 0.1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#FF00001A');
      res[3] = parseFloat(res[3].toFixed(1));
      assert.deepEqual(res, [255, 0, 0, 0.1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#f001');
      res[3] = parseFloat(res[3].toFixed(1));
      assert.deepEqual(res, [255, 0, 0, 0.1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#F001');
      res[3] = parseFloat(res[3].toFixed(1));
      assert.deepEqual(res, [255, 0, 0, 0.1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#f00');
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#F00');
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });
  });

  describe('hex to linear rgb', () => {
    const func = mjs.hexToLinearRgb;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('foo').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: foo',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('#ff0000');
      assert.deepEqual(res, [1, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#008000');
      res[1] = parseFloat(res[1].toFixed(5));
      assert.deepEqual(res, [0, 0.21586, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#000000');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff');
      assert.deepEqual(res, [1, 1, 1, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#0a0a0a');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.00304, 0.00304, 0.00304, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#0b0b0b');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.00335, 0.00335, 0.00335, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#01234567');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.0003, 0.01681, 0.05951, 0.40392], 'result');
    });

    it('should get value', async () => {
      const res = await func('#89abcdef');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.25016, 0.40724, 0.6105, 0.93725], 'result');
    });
  });

  describe('hex to xyz', () => {
    const func = mjs.hexToXyz;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('foo').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: foo',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('#ff0000');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.41239, 0.21264, 0.01933, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#008000');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#009900');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.11391, 0.22781, 0.03797, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#000000');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.95046, 1, 1.08906, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#0a0a0a');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.00288, 0.00304, 0.00331, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#0b0b0b');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.00318, 0.00335, 0.00364, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#01234567');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.01688, 0.01638, 0.05858, 0.40392], 'result');
    });

    it('should get value', async () => {
      const res = await func('#89abcdef');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.35897, 0.38851, 0.63367, 0.93725], 'result');
    });

    it('should get value', async () => {
      const res = await func('#7654cd');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.2166, 0.146, 0.59437, 1], 'result');
    });
  });

  describe('hex to xyz D50', () => {
    const func = mjs.hexToXyzD50;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('foo').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: foo',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('#ff0000');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.43607, 0.22249, 0.01392, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#008000');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.08314, 0.15475, 0.02096, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#009900');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.12269, 0.22836, 0.03092, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#000000');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.9643, 1, 0.8251, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#0a0a0a');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.00293, 0.00304, 0.0025, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#0b0b0b');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.00323, 0.00335, 0.00276, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#01234567');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.01512, 0.01572, 0.04413, 0.40392], 'result');
    });

    it('should get value', async () => {
      const res = await func('#89abcdef');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.35328, 0.38461, 0.47897, 0.93725], 'result');
    });

    it('should get value', async () => {
      const res = await func('#7654cd');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.20049, 0.14087, 0.44708, 1], 'result');
    });
  });

  describe('re-insert missing color components', () => {
    const func = mjs.reInsertMissingComponents;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('foo');
      assert.deepEqual(res, [undefined, undefined, undefined, undefined],
        'result');
    });

    it('should get value', async () => {
      const res = await func('none');
      assert.deepEqual(res, [undefined, undefined, undefined, undefined],
        'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(4 3 2 / 1)', [1, 2, 3, 0.4]);
      assert.deepEqual(res, [1, 2, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(none 2 3 / 0.4)', [0, 2, 3, 0.4]);
      assert.deepEqual(res, ['none', 2, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(1 none 3 / 0.4)', [1, 0, 3, 0.4]);
      assert.deepEqual(res, [1, 'none', 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(1 2 none / 0.4)', [1, 2, 0, 0.4]);
      assert.deepEqual(res, [1, 2, 'none', 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(1 2 3 / none)', [1, 2, 3, 0]);
      assert.deepEqual(res, [1, 2, 3, 'none'], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb none 0.2 0.3 / 0.4)', [0, 2, 3, 0.4]);
      assert.deepEqual(res, ['none', 2, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0.1 none 0.3 / 0.4)', [1, 0, 3, 0.4]);
      assert.deepEqual(res, [1, 'none', 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0.1 0.2 none / 0.4)', [1, 2, 0, 0.4]);
      assert.deepEqual(res, [1, 2, 'none', 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0.1 0.2 0.3 / none)', [1, 2, 3, 0.4]);
      assert.deepEqual(res, [1, 2, 3, 'none'], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(none 20% 10% / 0.4)', [1, 2, 0, 0.4]);
      assert.deepEqual(res, [1, 2, 'none', 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(3 none 10% / 0.4)', [1, 0, 3, 0.4]);
      assert.deepEqual(res, [1, 'none', 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(3 20% none / 0.4)', [0, 2, 3, 0.4]);
      assert.deepEqual(res, ['none', 2, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(3 20% 10% / none)', [1, 2, 3, 0]);
      assert.deepEqual(res, [1, 2, 3, 'none'], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(none 20% 10% / 0.4)', [1, 2, 0, 0.4]);
      assert.deepEqual(res, [1, 2, 'none', 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(90 none 10% / 0.4)', [1, 0, 3, 0.4]);
      assert.deepEqual(res, [1, 0, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(90 20% none / 0.4)', [0, 2, 3, 0.4]);
      assert.deepEqual(res, [0, 2, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(90 20% 10% / none)', [1, 2, 3, 0]);
      assert.deepEqual(res, [1, 2, 3, 'none'], 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(none 2 3 / 0.4)', [0, 2, 3, 0.4]);
      assert.deepEqual(res, ['none', 2, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(1 none 3 / 0.4)', [1, 0, 3, 0.4]);
      assert.deepEqual(res, [1, 0, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(1 2 none / 0.4)', [1, 2, 0, 0.4]);
      assert.deepEqual(res, [1, 2, 0, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(1 2 3 / none)', [1, 2, 3, 0]);
      assert.deepEqual(res, [1, 2, 3, 'none'], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(none 2 3 / 0.4)', [0, 2, 3, 0.4]);
      assert.deepEqual(res, ['none', 2, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(1 none 3 / 0.4)', [1, 0, 3, 0.4]);
      assert.deepEqual(res, [1, 0, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(1 2 none / 0.4)', [1, 2, 0, 0.4]);
      assert.deepEqual(res, [1, 2, 0, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(1 2 3 / none)', [1, 2, 3, 0]);
      assert.deepEqual(res, [1, 2, 3, 'none'], 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(none 2 3 / 0.4)', [0, 2, 3, 0.4]);
      assert.deepEqual(res, ['none', 2, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(1 none 3 / 0.4)', [1, 0, 3, 0.4]);
      assert.deepEqual(res, [1, 'none', 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(1 2 none / 0.4)', [1, 2, 0, 0.4]);
      assert.deepEqual(res, [1, 2, 'none', 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(1 2 3 / none)', [1, 2, 3, 0]);
      assert.deepEqual(res, [1, 2, 3, 'none'], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(none 2 3 / 0.4)', [0, 2, 3, 0.4]);
      assert.deepEqual(res, ['none', 2, 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(1 none 3 / 0.4)', [1, 0, 3, 0.4]);
      assert.deepEqual(res, [1, 'none', 3, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(1 2 none / 0.4)', [1, 2, 0, 0.4]);
      assert.deepEqual(res, [1, 2, 'none', 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(1 2 3 / none)', [1, 2, 3, 0]);
      assert.deepEqual(res, [1, 2, 3, 'none'], 'result');
    });
  });

  describe('normalize color components', () => {
    const func = mjs.normalizeColorComponents;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 4 but got 0.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, 1], []).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 4 but got 0.',
          'error message');
      });
    });

    it('should get values', async () => {
      const res = await func([1, 2, 3, 0.4], [5, 6, 7, 0.8]);
      assert.deepEqual(res, [
        [1, 2, 3, 0.4],
        [5, 6, 7, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func(['none', 2, 3, 0.4], ['none', 6, 7, 0.8]);
      assert.deepEqual(res, [
        [0, 2, 3, 0.4],
        [0, 6, 7, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func(['none', 2, 3, 0.4], [5, 6, 7, 0.8]);
      assert.deepEqual(res, [
        [5, 2, 3, 0.4],
        [5, 6, 7, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func([1, 2, 3, 0.4], ['none', 6, 7, 0.8]);
      assert.deepEqual(res, [
        [1, 2, 3, 0.4],
        [1, 6, 7, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func([1, 'none', 3, 0.4], [5, 'none', 7, 0.8]);
      assert.deepEqual(res, [
        [1, 0, 3, 0.4],
        [5, 0, 7, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func([1, 'none', 3, 0.4], [5, 6, 7, 0.8]);
      assert.deepEqual(res, [
        [1, 6, 3, 0.4],
        [5, 6, 7, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func([1, 2, 3, 0.4], [5, 'none', 7, 0.8]);
      assert.deepEqual(res, [
        [1, 2, 3, 0.4],
        [5, 2, 7, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func([1, 2, 'none', 0.4], [5, 6, 'none', 0.8]);
      assert.deepEqual(res, [
        [1, 2, 0, 0.4],
        [5, 6, 0, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func([1, 2, 'none', 0.4], [5, 6, 7, 0.8]);
      assert.deepEqual(res, [
        [1, 2, 7, 0.4],
        [5, 6, 7, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func([1, 2, 3, 0.4], [5, 6, 'none', 0.8]);
      assert.deepEqual(res, [
        [1, 2, 3, 0.4],
        [5, 6, 3, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func([1, 2, 3, 'none'], [5, 6, 7, 'none']);
      assert.deepEqual(res, [
        [1, 2, 3, 0],
        [5, 6, 7, 0]
      ]);
    });

    it('should get values', async () => {
      const res = await func([1, 2, 3, 'none'], [5, 6, 7, 0.8]);
      assert.deepEqual(res, [
        [1, 2, 3, 0.8],
        [5, 6, 7, 0.8]
      ]);
    });

    it('should get values', async () => {
      const res = await func([1, 2, 3, 0.4], [5, 6, 7, 'none']);
      assert.deepEqual(res, [
        [1, 2, 3, 0.4],
        [5, 6, 7, 0.4]
      ]);
    });
  });

  describe('parse alpha', () => {
    const func = mjs.parseAlpha;

    it('should throw', async () => {
      await func('foo').catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.', 'error message');
      });
    });

    it('should get value', async () => {
      const res = await func();
      assert.strictEqual(res, 1, 'result');
    });

    it('should get value', async () => {
      const res = await func();
      assert.strictEqual(res, 1, 'result');
    });

    it('should get value', async () => {
      const res = await func('');
      assert.strictEqual(res, 1, 'result');
    });

    it('should get value', async () => {
      const res = await func('none');
      assert.strictEqual(res, 0, 'result');
    });

    it('should get value', async () => {
      const res = await func('.5');
      assert.strictEqual(res, 0.5, 'result');
    });

    it('should get value', async () => {
      const res = await func('50%');
      assert.strictEqual(res, 0.5, 'result');
    });

    it('should get value', async () => {
      const res = await func('0.5');
      assert.strictEqual(res, 0.5, 'result');
    });

    it('should get value', async () => {
      const res = await func('-0.5');
      assert.strictEqual(res, 0, 'result');
    });

    it('should get value', async () => {
      const res = await func('1.1');
      assert.strictEqual(res, 1, 'result');
    });
  });

  describe('parse rgb()', () => {
    const func = mjs.parseRgb;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('rgb(1, 2, 3 / 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: rgb(1, 2, 3 / 1)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('rgb(none, 2, 3)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: rgb(none, 2, 3)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('rgb(1, none, 3)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: rgb(1, none, 3)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('rgb(1, 2, none)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: rgb(1, 2, none)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('rgba(1, 2, 3, none)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: rgba(1, 2, 3, none)',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('rgb(10% 20% 30% / 40%)');
      assert.deepEqual(res, [25.5, 51, 76.5, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(10% 20% 30% / -40%)');
      assert.deepEqual(res, [25.5, 51, 76.5, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(10% 20% 30% / 140%)');
      assert.deepEqual(res, [25.5, 51, 76.5, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(.1% .2% .3%)');
      assert.deepEqual(res, [0.255, 0.51, 0.765, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(.1% .2% .3% / .4)');
      assert.deepEqual(res, [0.255, 0.51, 0.765, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(none none none)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(none none none / none)');
      assert.deepEqual(res, [0, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(128 none none)');
      assert.deepEqual(res, [128, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(128 none none / none)');
      assert.deepEqual(res, [128, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(none none none / .5)');
      assert.deepEqual(res, [0, 0, 0, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(20% none none)');
      assert.deepEqual(res, [51, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(20% none none / none)');
      assert.deepEqual(res, [51, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(none none none / 50%)');
      assert.deepEqual(res, [0, 0, 0, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(none none none)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(none none none / none)');
      assert.deepEqual(res, [0, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(128 none none)');
      assert.deepEqual(res, [128, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(128 none none / none)');
      assert.deepEqual(res, [128, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(none none none / .5)');
      assert.deepEqual(res, [0, 0, 0, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(20% none none)');
      assert.deepEqual(res, [51, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(20% none none / none)');
      assert.deepEqual(res, [51, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(none none none / 50%)');
      assert.deepEqual(res, [0, 0, 0, 0.5], 'result');
    });
  });

  describe('parse hsl()', () => {
    const func = mjs.parseHsl;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('hsl(1, 2%, 3% / 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: hsl(1, 2%, 3% / 1)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('hsl(none, 2%, 3%)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: hsl(none, 2%, 3%)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('hsl(1, none, 3%)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: hsl(1, none, 3%)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('hsl(1, 2%, none)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: hsl(1, 2%, none)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('hsla(1, 2%, 3%, none)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: hsla(1, 2%, 3%, none)',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('hsl(0 100% 50% / 40%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [255, 0, 0, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(0 100% 50% / -40%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [255, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(0 100% 50% / 140%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(0 .1% 50%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [128, 128, 128, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(0 .1% .1%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [1, 1, 1, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(60deg 100% 50% / .4)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [255, 255, 0, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 100% 50%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [0, 255, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(180 100% 50%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [0, 255, 255, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(240 100% 50%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [0, 0, 255, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(300 100% 50%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [255, 0, 255, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(none none none / none)');
      assert.deepEqual(res, [0, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(none none none)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsla(none none none)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsla(none none none / none)');
      assert.deepEqual(res, [0, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 none none)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 0% 0%)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 80% 0%)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 none 50%)');
      assert.deepEqual(res, [127.5, 127.5, 127.5, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 0% 50%)');
      assert.deepEqual(res, [127.5, 127.5, 127.5, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 100% 50% / none)');
      assert.deepEqual(res, [0, 255, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 100% 50% / 0)');
      assert.deepEqual(res, [0, 255, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(none 100% 50% / 0)');
      assert.deepEqual(res, [255, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(0 100% 50% / 0)');
      assert.deepEqual(res, [255, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 100% 50% / 0)');
      assert.deepEqual(res, [0, 255, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(none 100% 50%)');
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(0 100% 50%)');
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });
  });

  describe('parse hwb()', () => {
    const func = mjs.parseHwb;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('hsw(1, 20%, 30% / 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: hsw(1, 20%, 30% / 1)',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('hwb(240 0% 0%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [0, 0, 255, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 0% 50%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [0, 128, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(0 0% 100%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(0 100% 100%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [128, 128, 128, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 70% 60%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [138, 138, 138, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 20% 30%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [51, 179, 51, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 .2% 30%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [1, 179, 1, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 20% .3%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [51, 255, 51, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(90deg 0% 50% / .5)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [64, 128, 0, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(90deg 0% 50% / 70%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [64, 128, 0, 0.7], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(90deg 0% 50% / -70%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [64, 128, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(90deg 0% 50% / 170%)');
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.ceil(res[i]);
        i++;
      }
      assert.deepEqual(res, [64, 128, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(none none none)');
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(none none none / none)');
      assert.deepEqual(res, [255, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 none none)');
      assert.deepEqual(res, [0, 255, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 80% none)');
      assert.deepEqual(res, [204, 255, 204, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 80% 0%)');
      assert.deepEqual(res, [204, 255, 204, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 none 50%)');
      assert.deepEqual(res, [0, 127.5, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 0% 50%)');
      assert.deepEqual(res, [0, 127.5, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 30% 50% / none)');
      res[1] = Math.round(res[1].toFixed(1));
      assert.deepEqual(res, [76.5, 128, 76.5, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 30% 50% / 0)');
      res[1] = Math.round(res[1].toFixed(1));
      assert.deepEqual(res, [76.5, 128, 76.5, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 30% 50% / none)');
      res[1] = Math.round(res[1].toFixed(1));
      assert.deepEqual(res, [76.5, 128, 76.5, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 30% 50% / 0)');
      res[1] = Math.round(res[1].toFixed(1));
      assert.deepEqual(res, [76.5, 128, 76.5, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(none 100% 50% / none)');
      res[1] = Math.round(res[1].toFixed(1));
      assert.deepEqual(res, [170, 170, 170, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(0 100% 50% / 0)');
      res[1] = Math.round(res[1].toFixed(1));
      assert.deepEqual(res, [170, 170, 170, 0], 'result');
    });
  });

  describe('parse lab()', () => {
    const func = mjs.parseLab;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('lab(100%, 20%, 30% / 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: lab(100%, 20%, 30% / 1)',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('lab(46.28% -47.57 48.58)');
      const val = await mjs.hexToXyzD50('#008000');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(0 0 0)');
      const val = await mjs.hexToXyzD50('#000000');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(100 0 0)');
      const val = await mjs.hexToXyzD50('#ffffff');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(110% 0 0)');
      const val = await mjs.hexToXyzD50('#ffffff');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(50 50 0)');
      const val =
        await mjs.convertColorToHex('rgb(75.6208% 30.4487% 47.5634%)')
          .then(mjs.hexToXyzD50);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(70 -45 0)');
      const val =
        await mjs.convertColorToHex('rgb(10.751% 75.558% 66.398%)')
          .then(mjs.hexToXyzD50);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(70 0 70)');
      const val =
        await mjs.convertColorToHex('rgb(76.6254% 66.3607% 5.5775%)')
          .then(mjs.hexToXyzD50);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(55 0 -60)');
      const val =
        await mjs.convertColorToHex('rgb(12.8128% 53.105% 92.7645%)')
          .then(mjs.hexToXyzD50);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(44.36 36.05 -59)');
      const val = await mjs.hexToXyzD50('#7654cd');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(44.36 36.05 -59 / 1)');
      const val = await mjs.hexToXyzD50('#7654cd');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(44.36 36.05 -59 / .5)');
      const val = await mjs.hexToXyzD50('#7654cd80');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      res[3] = parseFloat(res[3].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      val[3] = parseFloat(val[3].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(44.36 36.05 -59 / 50%)');
      const val = await mjs.hexToXyzD50('#7654cd80');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      res[3] = parseFloat(res[3].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      val[3] = parseFloat(val[3].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(44.36 36.05 -59 / -50%)');
      const val = await mjs.hexToXyzD50('#7654cd00');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      res[3] = parseFloat(res[3].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      val[3] = parseFloat(val[3].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(44.36 36.05 -59 / 150%)');
      const val = await mjs.hexToXyzD50('#7654cdff');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      res[3] = parseFloat(res[3].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      val[3] = parseFloat(val[3].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(.5% 50% 50%)');
      const val = await mjs.hexToXyzD50('#4c0000');
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      val[0] = parseFloat(Math.round(val[0]));
      val[1] = parseFloat(Math.round(val[1]));
      val[2] = parseFloat(Math.round(val[2]));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(-10% 50% 50%)');
      const val = await mjs.hexToXyzD50('#4b0000');
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      val[0] = parseFloat(Math.round(val[0]));
      val[1] = parseFloat(Math.round(val[1]));
      val[2] = parseFloat(Math.round(val[2]));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(50% 50% .5%)');
      const val = await mjs.hexToXyzD50('#d13a79');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(50% .5% 50%)');
      const val = await mjs.hexToXyzD50('#8a7500');
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      val[0] = parseFloat(Math.round(val[0]));
      val[1] = parseFloat(Math.round(val[1]));
      val[2] = parseFloat(Math.round(val[2]));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(none none none)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(none none none / none)');
      assert.deepEqual(res, [0, 0, 0, 0], 'result');
    });
  });

  describe('parse lch()', () => {
    const func = mjs.parseLch;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('lch(100%, 20%, 30% / 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: lch(100%, 20%, 30% / 1)',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('lch(46.278% 68.0 134.4)');
      const val = await mjs.hexToXyzD50('#008000');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(0% 0 0)');
      const val = await mjs.hexToXyzD50('#000000');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(100% 0 0)');
      const val = await mjs.hexToXyzD50('#ffffff');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(50% 50 0)');
      const val =
        await mjs.convertColorToHex('rgb(75.6208% 30.4487% 47.5634%)')
          .then(mjs.hexToXyzD50);
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(1));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(70% 45 180)');
      const val =
        await mjs.convertColorToHex('rgb(10.7906% 75.5567% 66.3982%)')
          .then(mjs.hexToXyzD50);
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(70% 70 90)');
      const val =
        await mjs.convertColorToHex('rgb(76.6254% 66.3607% 5.5775%)')
          .then(mjs.hexToXyzD50);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(55% 60 270)');
      const val =
        await mjs.convertColorToHex('rgb(12.8128% 53.105% 92.7645%)')
          .then(mjs.hexToXyzD50);
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(44.36% 69.13 301.43)');
      const val = await mjs.hexToXyzD50('#7654cd');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(44.36% 69.13 301.43 / 1)');
      const val = await mjs.hexToXyzD50('#7654cd');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(44.36% 69.13 301.43 / .5)');
      const val = await mjs.hexToXyzD50('#7654cd80');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(44.36% 69.13 301.43 / 50%)');
      const val = await mjs.hexToXyzD50('#7654cd80');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(44.36% 69.13 301.43 / -50%)');
      const val = await mjs.hexToXyzD50('#7654cd00');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(44.36% 69.13 301.43 / 150%)');
      const val = await mjs.hexToXyzD50('#7654cdff');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(.5% 20 30)');
      const val = await mjs.hexToXyzD50('#230000');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(Math.round(val[1]));
      val[2] = parseFloat(Math.round(val[2]));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(-10% 20 30)');
      const val = await mjs.hexToXyzD50('#220000');
      res[0] = parseFloat(res[0].toFixed(0));
      res[1] = parseFloat(res[1].toFixed(0));
      res[2] = parseFloat(Math.round(res[2]));
      val[0] = parseFloat(val[0].toFixed(0));
      val[1] = parseFloat(val[1].toFixed(0));
      val[2] = parseFloat(Math.round(val[2]));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(10% .5 30)');
      const val = await mjs.hexToXyzD50('#1c1b1b');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(10% 20% 30)');
      const val = await mjs.hexToXyzD50('#3c0602');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(10% 20 -30)');
      const val = await mjs.hexToXyzD50('#2d1129');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(none none none)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(none none none / none)');
      assert.deepEqual(res, [0, 0, 0, 0], 'result');
    });
  });

  describe('parse oklab()', () => {
    const func = mjs.parseOklab;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('oklab(100%, 20%, 30% / 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: oklab(100%, 20%, 30% / 1)',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('oklab(51.975% -0.1403 0.10768)');
      const val = await mjs.hexToXyz('#008000');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      val[0] = parseFloat(val[0].toFixed(4));
      val[1] = parseFloat(val[1].toFixed(4));
      val[2] = parseFloat(val[2].toFixed(4));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0 0 0)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(1 0 0)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.95046, 1, 1.08906, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(50% 0.05 0)');
      const val = await mjs.rgbToXyz([0.48477, 0.3429, 0.38412, 1]);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      val[0] = parseFloat(val[0].toFixed(4));
      val[1] = parseFloat(val[1].toFixed(4));
      val[2] = parseFloat(val[2].toFixed(4));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.7 -0.1 0)');
      const val = await mjs.rgbToXyz([0.29264, 0.70096, 0.63017, 1]);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      val[0] = parseFloat(val[0].toFixed(5));
      val[1] = parseFloat(val[1].toFixed(5));
      val[2] = parseFloat(val[2].toFixed(5));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(70% 0 0.125)');
      const val = await mjs.rgbToXyz([0.73942, 0.60484, 0.1965, 1]);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      val[0] = parseFloat(val[0].toFixed(5));
      val[1] = parseFloat(val[1].toFixed(5));
      val[2] = parseFloat(val[2].toFixed(5));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.55 0 -0.2)');
      const val = await mjs.rgbToXyz([0.27888, 0.38072, 0.89414, 1]);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      val[0] = parseFloat(val[0].toFixed(5));
      val[1] = parseFloat(val[1].toFixed(5));
      val[2] = parseFloat(val[2].toFixed(5));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54432 0.06817 -0.16567)');
      const val = await mjs.hexToXyz('#7654cd');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      val[0] = parseFloat(val[0].toFixed(4));
      val[1] = parseFloat(val[1].toFixed(4));
      val[2] = parseFloat(val[2].toFixed(4));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54432 0.06817 -0.16567 / 1)');
      const val = await mjs.hexToXyz('#7654cd');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      val[0] = parseFloat(val[0].toFixed(4));
      val[1] = parseFloat(val[1].toFixed(4));
      val[2] = parseFloat(val[2].toFixed(4));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54432 0.06817 -0.16567 / .5)');
      const val = await mjs.hexToXyz('#7654cd80');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      res[3] = parseFloat(res[3].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(4));
      val[1] = parseFloat(val[1].toFixed(4));
      val[2] = parseFloat(val[2].toFixed(4));
      val[3] = parseFloat(val[3].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54432 0.06817 -0.16567 / 50%)');
      const val = await mjs.hexToXyz('#7654cd80');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      res[3] = parseFloat(res[3].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(4));
      val[1] = parseFloat(val[1].toFixed(4));
      val[2] = parseFloat(val[2].toFixed(4));
      val[3] = parseFloat(val[3].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54432 0.06817 -0.16567 / -50%)');
      const val = await mjs.hexToXyz('#7654cd00');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      res[3] = parseFloat(res[3].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(4));
      val[1] = parseFloat(val[1].toFixed(4));
      val[2] = parseFloat(val[2].toFixed(4));
      val[3] = parseFloat(val[3].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54432 0.06817 -0.16567 / 150%)');
      const val = await mjs.hexToXyz('#7654cdff');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      res[3] = parseFloat(res[3].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(4));
      val[1] = parseFloat(val[1].toFixed(4));
      val[2] = parseFloat(val[2].toFixed(4));
      val[3] = parseFloat(val[3].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(.5% 20% 30%)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [-0.00079, 0.00027, -0.00618, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(-10% 20% 30%)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [-0.00096, 0.00029, -0.00678, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(10% 20% .5%)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.00261, 0.0007, 0.00067, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(10% .5% 30%)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.00201, 0.0008, -0.00075, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(none none none)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(none none none / none)');
      assert.deepEqual(res, [0, 0, 0, 0], 'result');
    });
  });

  describe('parse oklch()', () => {
    const func = mjs.parseOklch;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('oklch(100%, 20%, 30% / 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: oklch(100%, 20%, 30% / 1)',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('oklch(51.975% 0.17686 142.495)');
      const val = await mjs.hexToXyz('#008000');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      val[0] = parseFloat(val[0].toFixed(5));
      val[1] = parseFloat(val[1].toFixed(5));
      val[2] = parseFloat(val[2].toFixed(5));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(0% 0 0)');
      const val = await mjs.hexToXyz('#000000');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(100% 0 0)');
      const val = await mjs.hexToXyz('#ffffff');
      res[0] = parseFloat(res[0].toFixed(0));
      res[1] = parseFloat(res[1].toFixed(0));
      res[2] = parseFloat(res[2].toFixed(0));
      val[0] = parseFloat(val[0].toFixed(0));
      val[1] = parseFloat(val[1].toFixed(0));
      val[2] = parseFloat(val[2].toFixed(0));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(50% 0.2 0)');
      const val =
        await mjs.convertColorToHex('rgb(70.492% 2.351% 37.073%)')
          .then(mjs.hexToXyz);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(50% 0.2 270)');
      const val =
        await mjs.convertColorToHex('rgb(23.056% 31.73% 82.628%)')
          .then(mjs.hexToXyz);
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(80% 0.15 160)');
      const val =
        await mjs.convertColorToHex('rgb(32.022% 85.805% 61.147%)')
          .then(mjs.hexToXyz);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(55% 0.15 345)');
      const val =
        await mjs.convertColorToHex('rgb(67.293% 27.791% 52.28%)')
          .then(mjs.hexToXyz);
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(54% 0.18 292.37)');
      const val = await mjs.hexToXyz('#7654cd');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(2));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(1));
      val[2] = parseFloat(val[2].toFixed(2));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(54% 0.18 292.37 / 1)');
      const val = await mjs.hexToXyz('#7654cd');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(2));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(1));
      val[2] = parseFloat(val[2].toFixed(2));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(54% 0.18 292.37 / .5)');
      const val = await mjs.hexToXyz('#7654cd80');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(2));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(1));
      val[2] = parseFloat(val[2].toFixed(2));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(54% 0.18 292.37 / 50%)');
      const val = await mjs.hexToXyz('#7654cd80');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(2));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(1));
      val[2] = parseFloat(val[2].toFixed(2));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(54% 0.18 292.37 / -50%)');
      const val = await mjs.hexToXyz('#7654cd00');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(2));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(1));
      val[2] = parseFloat(val[2].toFixed(2));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(54% 0.18 292.37 / 150%)');
      const val = await mjs.hexToXyz('#7654cdff');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(2));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(1));
      val[2] = parseFloat(val[2].toFixed(2));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(.5 20% 30)');
      const val = await mjs.hexToXyz('#8b5148');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(-10% 20% 30)');
      res[0] = parseFloat(Math.round(res[0].toFixed(1)));
      res[1] = parseFloat(Math.round(res[1].toFixed(1)));
      res[2] = parseFloat(Math.round(res[2].toFixed(1)));
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(10% 20% .5)');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [0.003, 0.001, 0.001, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(10% .5 30)');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [0.037, -0, -0.031, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(10% -0.5 30)');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [0.001, 0.001, 0.001, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(none none none)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(none none none / none)');
      assert.deepEqual(res, [0, 0, 0, 0], 'result');
    });
  });

  describe('parse color func', () => {
    const func = mjs.parseColorFunc;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color(in foo, 1 1 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color(in foo, 1 1 1)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color(srgb foo bar baz)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color(srgb foo bar baz)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color(srgb 1 bar baz)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color(srgb 1 bar baz)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color(srgb 1 1 baz)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color(srgb 1 1 baz)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color(srgb 1 1 1 qux)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color(srgb 1 1 1 qux)',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.5 0)');
      const value = await mjs.parseColor('rgb(0% 50% 0%)');
      assert.deepEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.5 0)', true);
      const value = await mjs.parseColor('rgb(0% 50% 0%)', true);
      assert.deepEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.11391, 0.22781, 0.03797, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.12269, 0.22836, 0.03092, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 50% 50% 50% / 50%)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.20344, 0.21404, 0.2331, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb .5 .5 .5 / .5)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.20344, 0.21404, 0.2331, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0 / 0.5)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.11391, 0.22781, 0.03797, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0 / 50%)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.11391, 0.22781, 0.03797, 0.5], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0 / 150%)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.11391, 0.22781, 0.03797, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0 / -1)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.11391, 0.22781, 0.03797, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 0 0.21586 0)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 0 0.21586 0)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.08314, 0.15475, 0.02096, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 0.26374 0.59085 0.16434)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.11391, 0.22781, 0.03797, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 0.26374 0.59085 0.16434)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.12269, 0.22836, 0.03092, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 0.299218 0.533327 0.120785)');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.1139, 0.22781, 0.03797, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 0.299218 0.533327 0.120785)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.12269, 0.22836, 0.03092, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 0 1 0)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.1657, 0.67532, 0.02998, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 0.33582 0.59441 0.13934)');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.1139, 0.22781, 0.03797, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 0.33582 0.59441 0.13934)', true);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.1227, 0.22836, 0.03092, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 0.2861 0.49131 0.16133)');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.1139, 0.22781, 0.038, 1], 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color(prophoto-rgb 0.2861 0.49131 0.16133)', true);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.1227, 0.22836, 0.0309, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 0 1 0)');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.1127, 0.71512, -0.0129, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 0 1 0)', true);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.1352, 0.71184, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 0.07719 0.15438 0.02573)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 0.07719 0.15438 0.02573)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.08314, 0.15475, 0.02096, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d65 0.07719 0.15438 0.02573)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d65 0.07719 0.15438 0.02573)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.08314, 0.15475, 0.02096, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 0.08314 0.15475 0.02096)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 0.08314 0.15475 0.02096)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.08314, 0.15475, 0.02096, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 1 1 / 1)');
      const val = await func('color(srgb none 1 1 / 1)');
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 1 0 1 / 1)');
      const val = await func('color(srgb 1 none 1 / 1)');
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 1 1 none / 1)');
      const val = await func('color(srgb 1 1 none / 1)');
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 1 1 1 / 0)', {
        alpha: true
      });
      const val = await func('color(srgb 1 1 1 / none)', {
        alpha: true
      });
      assert.deepEqual(res, val, 'result');
    });
  });

  describe('parse color keywords and functions', () => {
    const func = mjs.parseColor;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('foo').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Invalid property value: foo',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('#12345').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Invalid property value: #12345',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('foo(1 1 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Invalid property value: foo(1 1 1)',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('currentColor');
      assert.deepEqual(res, [0, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('transparent');
      assert.deepEqual(res, [0, 0, 0, 0], 'result');
    });

    it('should get value', async () => {
      const res = await func('green');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('green', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.08314, 0.15475, 0.02096, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#008000');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#008000', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.08314, 0.15475, 0.02096, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#080');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.08804, 0.17608, 0.02935, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#00800080', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.08314, 0.15475, 0.02096, 0.50196], 'result');
    });

    it('should get value', async () => {
      const res = await func('#0808');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      res[3] = parseFloat(res[3].toFixed(5));
      assert.deepEqual(res, [0.08804, 0.17608, 0.02935, 0.53333], 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(46.28% -47.57 48.58)');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.0772, 0.1544, 0.0257, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(46.28% -47.57 48.58)', true);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.0831, 0.1548, 0.021, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(46.2775% 67.9892 134.3912)');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.0772, 0.1544, 0.0257, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(46.2775% 67.9892 134.3912)', true);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.0831, 0.155, 0.021, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(51.975% -0.1403 0.10768)');
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(4));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.0772, 0.1544, 0.0257, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(51.975% -0.1403 0.10768)', true);
      res[0] = parseFloat(res[0].toFixed(4));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.0831, 0.155, 0.021, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(51.975% 0.17686 142.495)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(51.975% 0.17686 142.495)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.08314, 0.15475, 0.021, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(0 128 0)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(0 128 0)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(4));
      assert.deepEqual(res, [0.08314, 0.15475, 0.021, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 100% 25%)');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [0.077, 0.15, 0.026, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 100% 25%)', true);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [0.08, 0.15, 0.021, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 0% 49.8039%)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.07719, 0.15438, 0.02573, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(120 0% 49.8039%)', true);
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0.08314, 0.15475, 0.02096, 1], 'result');
    });
  });

  describe('convert color to linear rgb', () => {
    const func = mjs.convertColorToLinearRgb;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('green');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0, 0.21586, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0 / 0.5)');
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0, 0.31855, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0 / 0.5)', {
        alpha: true
      });
      res[0] = parseFloat(res[0].toFixed(5));
      res[1] = parseFloat(res[1].toFixed(5));
      res[2] = parseFloat(res[2].toFixed(5));
      assert.deepEqual(res, [0, 0.31855, 0, 0.5], 'result');
    });
  });

  describe('convert color to rgb', () => {
    const func = mjs.convertColorToRgb;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('green');
      assert.deepEqual(res, [0, 128, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.5 0 / 0.5)');
      assert.deepEqual(res, [0, 128, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.5 0 / 0.5)', {
        alpha: true
      });
      assert.deepEqual(res, [0, 128, 0, 0.5], 'result');
    });
  });

  describe('convert rgb to hex color', () => {
    const func = mjs.convertRgbToHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([128, 192, 256]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '256 is not between 0 and 255.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func([255, 0, 128]);
      assert.deepEqual(res, '#ff0080', 'result');
    });

    it('should get value', async () => {
      const res = await func([255, 0, 128, 1]);
      assert.deepEqual(res, '#ff0080', 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0, 0, 1]);
      assert.deepEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func([255, 255, 255, 1]);
      assert.deepEqual(res, '#ffffff', 'result');
    });

    it('should get value', async () => {
      const res = await func([1, 35, 69, 0.40392]);
      assert.deepEqual(res, '#01234567', 'result');
    });

    it('should get value', async () => {
      const res = await func([137, 171, 205, 0.93725]);
      assert.deepEqual(res, '#89abcdef', 'result');
    });
  });

  describe('convert linear rgb to hex color', () => {
    const func = mjs.convertLinearRgbToHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 4 but got 3.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func([1, 0, 0, 1]);
      assert.deepEqual(res, '#ff0000', 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0.21586, 0, 1]);
      assert.deepEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0, 0, 1]);
      assert.deepEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func([1, 1, 1, 1]);
      assert.deepEqual(res, '#ffffff', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.00304, 0.00304, 0.00304, 1]);
      assert.deepEqual(res, '#0a0a0a', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.00335, 0.00335, 0.00335, 1]);
      assert.deepEqual(res, '#0b0b0b', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.0003, 0.01681, 0.05951, 0.40392]);
      assert.deepEqual(res, '#01234567', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.25016, 0.40724, 0.6105, 0.93725]);
      assert.deepEqual(res, '#89abcdef', 'result');
    });
  });

  describe('convert xyz to hex color', () => {
    const func = mjs.convertXyzToHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 4 but got 3.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func([0.41239, 0.21264, 0.01933, 1]);
      assert.deepEqual(res, '#ff0000', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.07719, 0.15438, 0.02573, 1]);
      assert.deepEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0, 0, 1]);
      assert.deepEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.95046, 1, 1.08906, 1]);
      assert.deepEqual(res, '#ffffff', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.00288, 0.00304, 0.00331, 1]);
      assert.deepEqual(res, '#0a0a0a', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.00318, 0.00335, 0.00364, 1]);
      assert.deepEqual(res, '#0b0b0b', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.01688, 0.01638, 0.05858, 0.40392]);
      assert.deepEqual(res, '#01234567', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.35897, 0.38851, 0.63367, 0.93725]);
      assert.deepEqual(res, '#89abcdef', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.148, 0.119, 0.076, 1]);
      assert.deepEqual(res, '#8b5148', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.037, 0, -0.031, 1]);
      assert.deepEqual(res, '#670000', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.21661, 0.14602, 0.59452, 1]);
      assert.deepEqual(res, '#7654cd', 'result');
    });
  });

  describe('convert xyz D50 to hex color', () => {
    const func = mjs.convertXyzD50ToHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 4 but got 3.',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func([0.43601, 0.22247, 0.01393, 1]);
      assert.deepEqual(res, '#ff0000', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.08312, 0.15475, 0.02096, 1]);
      assert.deepEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func([0, 0, 0, 1]);
      assert.deepEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.96419, 1, 0.82538, 1]);
      assert.deepEqual(res, '#ffffff', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.00293, 0.00304, 0.00251, 1]);
      assert.deepEqual(res, '#0a0a0a', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.00323, 0.00335, 0.00276, 1]);
      assert.deepEqual(res, '#0b0b0b', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.01512, 0.01572, 0.04415, 0.40392]);
      assert.deepEqual(res, '#01234567', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.35326, 0.38462, 0.47913, 0.93725]);
      assert.deepEqual(res, '#89abcdef', 'result');
    });

    it('should get value', async () => {
      const res = await func([0.2005, 0.14089, 0.4472, 1]);
      assert.deepEqual(res, '#7654cd', 'result');
    });
  });

  describe('convert color to hex color', () => {
    const func = mjs.convertColorToHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should get null', async () => {
      const res = await func('foo');
      assert.isNull(res, 'result');
    });

    it('should get value', async () => {
      const res = await func('currentColor');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('currentColor', {
        alpha: true
      });
      assert.strictEqual(res, '#00000000', 'result');
    });

    it('should get null', async () => {
      const res = await func('transparent');
      assert.isNull(res, 'result');
    });

    it('should get value', async () => {
      const res = await func('transparent', {
        alpha: true
      });
      assert.strictEqual(res, '#00000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('black');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('red', {
        alpha: true
      });
      assert.strictEqual(res, '#ff0000', 'result');
    });

    it('should get value', async () => {
      const res = await func('WHITE');
      assert.strictEqual(res, '#ffffff', 'result');
    });

    it('should get value', async () => {
      const res = await func('#123456');
      assert.strictEqual(res, '#123456', 'result');
    });

    it('should get value', async () => {
      const res = await func('#abcdef', {
        alpha: true
      });
      assert.strictEqual(res, '#abcdef', 'result');
    });

    it('should get value', async () => {
      const res = await func('#12345678');
      assert.strictEqual(res, '#123456', 'result');
    });

    it('should get value', async () => {
      const res = await func('#abcdef12', {
        alpha: true
      });
      assert.strictEqual(res, '#abcdef12', 'result');
    });

    it('should get value', async () => {
      const res = await func('#1234');
      assert.strictEqual(res, '#112233', 'result');
    });

    it('should get value', async () => {
      const res = await func('#abcd', {
        alpha: true
      });
      assert.strictEqual(res, '#aabbccdd', 'result');
    });

    it('should get value', async () => {
      const res = await func('#123');
      assert.strictEqual(res, '#112233', 'result');
    });

    it('should get value', async () => {
      const res = await func('#abc', {
        alpha: true
      });
      assert.strictEqual(res, '#aabbcc', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(1 2 3 / 0.5)');
      assert.strictEqual(res, '#010203', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(10 20 30 / 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, '#0a141e80', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(0 0 0 / 1%)', {
        alpha: true
      });
      assert.strictEqual(res, '#00000003', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(1,2,3,0.5)');
      assert.strictEqual(res, '#010203', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(1,2,3,0.5)', {
        alpha: true
      });
      assert.strictEqual(res, '#01020380', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(1,2,3,1)');
      assert.strictEqual(res, '#010203', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(46.27% 32.94% 80.39%)');
      assert.strictEqual(res, '#7654cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(240 100% 50% / 0.5)');
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(-120deg 100% 50% / 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, '#0000ff80', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 100% 0% / 1%)', {
        alpha: true
      });
      assert.strictEqual(res, '#00000003', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(240 100% 50%)');
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsla(180,50%,50%,0.5)');
      assert.strictEqual(res, '#40bfbf', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsla(180,50%,50%,0.5)', {
        alpha: true
      });
      assert.strictEqual(res, '#40bfbf80', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsla(180,50%,50%,1)', {
        alpha: true
      });
      assert.strictEqual(res, '#40bfbf', 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(240 100% 50%)');
      assert.strictEqual(res, '#aaaaaa', 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(110 20% 30% / 40%)', {
        alpha: true
      });
      assert.strictEqual(res, '#48b33366', 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(44.36 36.05 -59 / 1)');
      assert.deepEqual(res, '#7654cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(44.36 36.05 -59 / 0.5)', {
        alpha: true
      });
      assert.deepEqual(res, '#7654cd80', 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(44.36% 69.13 301.43 / 1)');
      assert.deepEqual(res, '#7654cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(44.36% 69.13 301.43 / 0.5)', {
        alpha: true
      });
      assert.deepEqual(res, '#7654cd80', 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54432 0.06817 -0.16567 / 1)');
      assert.deepEqual(res, '#7654cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54432 0.06817 -0.16567 / 0.5)', {
        alpha: true
      });
      assert.deepEqual(res, '#7654cd80', 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(54.4% 0.179 292.365 / 1)');
      assert.deepEqual(res, '#7654cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(54.4% 0.179 292.365 / 0.5)', {
        alpha: true
      });
      assert.deepEqual(res, '#7654cd80', 'result');
    });

    // active tab border color of the default theme with alpha channel
    it('should get value', async () => {
      const res = await func('rgba(128,128,142,0.4)', {
        alpha: true
      });
      assert.strictEqual(res, '#80808e66', 'result');
    });
  });

  describe('convert color() to hex color', () => {
    const func = mjs.convertColorFuncToHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color(in foo, 1 1 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color(in foo, 1 1 1)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color(srgb foo bar baz)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color(srgb foo bar baz)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color(srgb 1 bar baz)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color(srgb 1 bar baz)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color(srgb 1 1 baz)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color(srgb 1 1 baz)',
          'error message');
      });
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0)');
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0% 60% 0%)');
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0 / 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, '#00990080', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0 / 50%)', {
        alpha: true
      });
      assert.strictEqual(res, '#00990080', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0 / -50%)', {
        alpha: true
      });
      assert.strictEqual(res, '#00990000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.6 0 / 150%)', {
        alpha: true
      });
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0.3 0.5 0.7 / none)', {
        alpha: true
      });
      assert.strictEqual(res, '#4d7fb300', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb none 0.5 0.7)');
      assert.strictEqual(res, '#0080b3', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0.3 none 0.7)');
      assert.strictEqual(res, '#4d00b3', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0.3 0.5 none)');
      assert.strictEqual(res, '#4d7f00', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb none 50% 70%)');
      assert.strictEqual(res, '#0080b3', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 30% none 70%)');
      assert.strictEqual(res, '#4d00b3', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 30% 50% none)');
      assert.strictEqual(res, '#4d7f00', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 0 0.21586 0)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 0 0 0)');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 1 1 1)');
      const val = await func('color(srgb 1 1 1)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 0 1 0)');
      const val = await mjs.convertColorToHex('lab(87.8185% -79.271 80.9946)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 43.5% 1.7% 5.5%)');
      const val = await func('color(srgb 0.691 0.139 0.259)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear none 0.5 0.7)');
      assert.strictEqual(res, '#00bcda', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 0.3 none 0.7)');
      assert.strictEqual(res, '#9500da', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 0.3 0.5 none)');
      assert.strictEqual(res, '#95bc00', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear none 50% 70%)');
      assert.strictEqual(res, '#00bcda', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 30% none 70%)');
      assert.strictEqual(res, '#9500da', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb-linear 30% 50% none)');
      assert.strictEqual(res, '#95bc00', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 0.26374 0.59085 0.16434 / 1)');
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 26.374% 59.085% 16.434%)');
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 0.21604 0.49418 0.13151)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 0 0 0)');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 1 1 1)');
      assert.strictEqual(res, '#ffffff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 0 1 0)');
      const val =
        await mjs.convertColorToHex('lab(86.61399% -106.539 102.871)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 1 1 0.330897)');
      const val = await mjs.convertColorToHex('yellow');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 0.465377 0.532768 0.317713)');
      const val = await mjs.convertColorToHex('lch(54% 35 118)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 none 0.5 0.7)');
      assert.strictEqual(res, '#0082b7', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 0.3 none 0.7)');
      assert.strictEqual(res, '#5400ba', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 0.3 0.5 none)');
      assert.strictEqual(res, '#398100', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 none 50% 70%)');
      assert.strictEqual(res, '#0082b7', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 30% none 70%)');
      assert.strictEqual(res, '#5400ba', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(display-p3 30% 50% none)');
      assert.strictEqual(res, '#398100', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 0.299218 0.533327 0.120785 / 1)');
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 29.9218% 53.3327% 12.0785%)');
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 0.235202 0.431704 0.085432)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 0 0 0)');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 1 1 1)');
      assert.strictEqual(res, '#ffffff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 0 1 0)');
      const val =
        await mjs.convertColorToHex('lab(85.7729% -160.7259 109.2319)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 none 0.5 0.7)');
      assert.strictEqual(res, '#0093c0', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 0.3 none 0.7)');
      assert.strictEqual(res, '#6800c4', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 0.3 0.5 none)');
      assert.strictEqual(res, '#299100', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 none 50% 70%)');
      assert.strictEqual(res, '#0093c0', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 30% none 70%)');
      assert.strictEqual(res, '#6800c4', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(rec2020 30% 50% none)');
      assert.strictEqual(res, '#299100', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 0.33582 0.59441 0.13934 / 1)');
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 33.582% 59.441% 13.934%)');
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 0.281363 0.498012 0.116746)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 0 0 0)');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 1 1 1)');
      assert.strictEqual(res, '#ffffff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 0 1 0)');
      const val =
        await mjs.convertColorToHex('lab(83.2141% -129.1072 87.1718)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb none 0.5 0.7)');
      assert.strictEqual(res, '#0081b6', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 0.3 none 0.7)');
      assert.strictEqual(res, '#5900b7', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 0.3 0.5 none)');
      assert.strictEqual(res, '#1d8100', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb none 50% 70%)');
      assert.strictEqual(res, '#0081b6', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 30% none 70%)');
      assert.strictEqual(res, '#5900b7', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(a98-rgb 30% 50% none)');
      assert.strictEqual(res, '#1d8100', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 0.2861 0.49131 0.16133 / 1)');
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 28.610% 49.131% 16.133%)');
      assert.strictEqual(res, '#009900', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 0.230479 0.395789 0.129968)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 0 0 0)');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 1 1 1)');
      assert.strictEqual(res, '#ffffff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 0 1 0)');
      const val =
        await mjs.convertColorToHex('lab(87.5745% -186.6921 150.9905)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb none 0.5 0.7)');
      assert.strictEqual(res, '#00a0c6', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 0.3 none 0.7)');
      assert.strictEqual(res, '#4c00cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 0.3 0.5 none)');
      assert.strictEqual(res, '#2b9b00', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb none 50% 70%)');
      assert.strictEqual(res, '#00a0c6', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 30% none 70%)');
      assert.strictEqual(res, '#4c00cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(prophoto-rgb 30% 50% none)');
      assert.strictEqual(res, '#2b9b00', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 0.07719 0.15438 0.02573)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d65 0.07719 0.15438 0.02573)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 7.719% 15.438% 2.573%)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 0 0 0)');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 1 1 1)');
      const val = await mjs.convertColorToHex('lab(100.115% 9.06448 5.80177)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 0 1 0)');
      const val = await mjs.convertColorToHex('lab(99.6289% -354.58 146.707)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 0.08312 0.154746 0.020961)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 8.312% 15.4746% 2.0961%)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 0 0 0)');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 1 1 1)');
      const val = await mjs.convertColorToHex('lab(100% 6.1097 -13.2268)');
      assert.strictEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz none 0.5 0.7)');
      assert.strictEqual(res, '#00fbd1', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 0.3 none 0.7)');
      assert.strictEqual(res, '#cf00e1', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 0.3 0.5 none)');
      assert.strictEqual(res, '#7dd200', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz none 50% 70%)');
      assert.strictEqual(res, '#00fbd1', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 30% none 70%)');
      assert.strictEqual(res, '#cf00e1', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz 30% 50% none)');
      assert.strictEqual(res, '#7dd200', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d65 none 0.5 0.7)');
      assert.strictEqual(res, '#00fbd1', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d65 0.3 none 0.7)');
      assert.strictEqual(res, '#cf00e1', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d65 0.3 0.5 none)');
      assert.strictEqual(res, '#7dd200', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d65 none 50% 70%)');
      assert.strictEqual(res, '#00fbd1', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d65 30% none 70%)');
      assert.strictEqual(res, '#cf00e1', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d65 30% 50% none)');
      assert.strictEqual(res, '#7dd200', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 none 0.5 0.7)');
      assert.strictEqual(res, '#00fdf0', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 0.3 none 0.7)');
      assert.strictEqual(res, '#cb00ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 0.3 0.5 none)');
      assert.strictEqual(res, '#66d500', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 none 50% 70%)');
      assert.strictEqual(res, '#00fdf0', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 30% none 70%)');
      assert.strictEqual(res, '#cb00ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color(xyz-d50 30% 50% none)');
      assert.strictEqual(res, '#66d500', 'result');
    });
  });

  describe('convert color-mix() to hex color', () => {
    const func = mjs.convertColorMixToHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color-mix(in srgb, blue)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color-mix(in srgb, blue)',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color-mix(in srgb, blue -10%, red)').catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-10% is not between 0% and 100%.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color-mix(in srgb, blue 110%, red)').catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '110% is not between 0% and 100%.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color-mix(in srgb, blue, red -10%)').catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-10% is not between 0% and 100%.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color-mix(in srgb, blue, red 110%)').catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '110% is not between 0% and 100%.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color-mix(in srgb, blue -10%, red 10%)').catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-10% is not between 0% and 100%.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color-mix(in srgb, blue 110%, red 10%)').catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '110% is not between 0% and 100%.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color-mix(in srgb, blue 10%, red -10%)').catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-10% is not between 0% and 100%.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color-mix(in srgb, blue 10%, red 110%)').catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '110% is not between 0% and 100%.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('color-mix(in srgb, blue 0%, red 0%)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: color-mix(in srgb, blue 0%, red 0%)',
          'error message');
      });
    });

    it('should warn', async () => {
      const res = await func('color-mix(in srgb, currentcolor, red)', {
        alpha: true
      });
      assert.strictEqual(res, '#ff0000', 'result');
    });

    it('should warn', async () => {
      const res = await func('color-mix(in srgb, blue, currentcolor)', {
        alpha: true
      });
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, blue, red)');
      const value = await mjs.convertColorToHex('rgb(128, 0, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, blue, green)');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, #0000ff, #008000)');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in srgb, rgb(0 0 255), rgb(0 128 0))');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in srgb, hsl(240 100% 50%), hsl(120 100% 25%))');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in srgb, hwb(240 0% 0%), hwb(120 0% 50%))');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, rgba(255, 0, 0, 0.2), red)');
      const value = await mjs.convertColorToHex('rgba(255, 0, 0, 0.6)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, blue 80%, red 80%)');
      const value = await mjs.convertColorToHex('rgb(128, 0, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, blue 10%, red)');
      const value = await mjs.convertColorToHex('rgb(230, 0, 26)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, blue 100%, red)');
      const value = await mjs.convertColorToHex('rgb(0, 0, 255)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in srgb, rgba(0, 0, 255, 0.5) 100%, red)');
      const value = await mjs.convertColorToHex('rgb(0, 0, 255, 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in srgb, red, rgba(0, 0, 255, 0.5) 100%)');
      const value = await mjs.convertColorToHex('rgb(0, 0, 255, 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, rgb(100% 0% 0% / 0.7) 25%, rgb(0% 100% 0% / 0.2))');
      const value =
        await mjs.convertColorToHex('rgb(53.846% 46.154% 0% / 0.325)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, rgb(100% 0% 0% / 0.7) 20%, rgb(0% 100% 0% / 0.2) 60%)');
      const value =
        await mjs.convertColorToHex('rgb(53.846% 46.154% 0% / 0.26)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in srgb, blue, lab(46.2775% -47.5621 48.5837))');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in srgb, lab(46.2775% -47.5621 48.5837), blue)');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, blue, red)');
      assert.strictEqual(res, '#bc00bc', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, blue, green)');
      assert.strictEqual(res, '#005cbc', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, #0000ff, #008000)');
      assert.strictEqual(res, '#005cbc', 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in srgb-linear, rgb(0 0 255), rgb(0 128 0))');
      assert.strictEqual(res, '#005cbc', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, hsl(240 100% 50%), hsl(120 100% 25%))');
      assert.strictEqual(res, '#005cbc', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, hwb(240 0% 0%), hwb(120 0% 50%))');
      assert.strictEqual(res, '#005cbc', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, rgba(255, 0, 0, 0.2), red)', {
        alpha: true
      });
      assert.strictEqual(res, '#a2000099', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, blue 80%, red 80%)');
      assert.strictEqual(res, '#bc00bc', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, blue 10%, red)');
      assert.strictEqual(res, '#f30059', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, blue 100%, red)');
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, rgba(0, 0, 255, 0.5) 100%, red)', {
        alpha: true
      });
      assert.strictEqual(res, '#00008980', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, red, rgba(0, 0, 255, 0.5) 100%)', {
        alpha: true
      });
      assert.strictEqual(res, '#00008980', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, rgb(100% 0% 0% / 0.7) 25%, rgb(0% 100% 0% / 0.2))', {
        alpha: true
      });
      assert.strictEqual(res, '#433e0053', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, rgb(100% 0% 0% / 0.7) 20%, rgb(0% 100% 0% / 0.2) 60%)', {
        alpha: true
      });
      assert.strictEqual(res, '#433e0042', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, currentColor, red)');
      assert.strictEqual(res, '#ff0000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb-linear, blue, currentColor)');
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz, red, green)');
      const value = await mjs.convertColorToHex('rgb(188, 92, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz, red, green 90%)');
      const value = await mjs.convertColorToHex('rgb(89, 122, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz, red 90%, green)');
      const value = await mjs.convertColorToHex('rgb(243, 40, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in xyz, color(srgb 1 0 0), color(srgb 0 0.5 0))');
      const value = await mjs.convertColorToHex('rgb(188, 92, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz, color(srgb 1 0 0 / 0.5), color(srgb 0 0.5 0 / 0.5))', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgb(99, 45, 0, 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz-d65, red, green)');
      const value = await mjs.convertColorToHex('rgb(188, 92, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz-d65, red, green 90%)');
      const value = await mjs.convertColorToHex('rgb(89, 122, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz-d65, red 90%, green)');
      const value = await mjs.convertColorToHex('rgb(243, 40, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz, currentColor, red)');
      assert.strictEqual(res, '#ff0000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz, blue, currentColor)');
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz-d50, red, green)');
      const value = await mjs.convertColorToHex('rgb(188, 92, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz-d50, red, green 90%)');
      const value = await mjs.convertColorToHex('rgb(89, 122, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz-d50, red 90%, green)');
      const value = await mjs.convertColorToHex('rgb(243, 40, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz-d50, color(srgb 1 0 0), color(srgb 0 0.5 0))');
      const value = await mjs.convertColorToHex('rgb(188, 92, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz-d50, color(srgb 1 0 0 / 0.5), color(srgb 0 0.5 0 / 0.5))', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgb(99, 45, 0, 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz-d50, currentColor, blue)');
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in xyz-d50, red, currentColor)');
      assert.strictEqual(res, '#ff0000', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, blue, green)');
      const value = await mjs.convertColorToHex('hsl(180 100% 37.6%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hsl, color(srgb 0 0 1), color(srgb 0 0.5 0))');
      const value = await mjs.convertColorToHex('hsl(180 100% 37.5%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hsl, white, green)');
      const value = await mjs.convertColorToHex('hsl(120 100% 62.549%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%), hsl(30 30% 40%))');
      const value = await mjs.convertColorToHex('hsl(75 20% 30%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%) 25%, hsl(30 30% 40%))');
      const value = await mjs.convertColorToHex('hsl(52.5 25% 35%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%), hsl(30 30% 40%) 25%)');
      const value = await mjs.convertColorToHex('hsl(97.5 15% 25%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20%) 25%, hsl(30 30% 40%) 75%)');
      const value = await mjs.convertColorToHex('hsl(52.5 25% 35%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20%) 30%, hsl(30 30% 40%) 90%)');
      const value = await mjs.convertColorToHex('hsl(52.5 25% 35%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20%) 12.5%, hsl(30 30% 40%) 37.5%)', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hsl(52.5 25% 35% / 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%) 0%, hsl(30 30% 40%))');
      const value = await mjs.convertColorToHex('hsl(30 30% 40%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4), hsl(30 30% 40% / .8))', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgba(95, 105, 65, 0.6)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20%) 25%, hsl(30 30% 40% / .8))', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgba(108, 103, 66, 0.85)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4), hsl(30 30% 40% / .8) 25%)', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgba(68, 84, 59, 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4) 25%, hsl(30 30% 40% / .8) 75%)', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgba(120, 114, 69, 0.7)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4) 30%, hsl(30 30% 40% / .8) 90%)', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgba(120, 114, 69, 0.7)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4) 12.5%, hsl(30 30% 40% / .8) 37.5%)', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgba(120, 114, 69, 0.35)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4) 0%, hsl(30 30% 40% / .8))', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgba(133, 102, 71, 0.8)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, blue, green)');
      const value = await mjs.convertColorToHex('hwb(180 0% 25%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hwb, color(srgb 0 0 1), color(srgb 0 0.5 0))');
      const value = await mjs.convertColorToHex('hwb(180 0% 25%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, white, green)');
      const value = await mjs.convertColorToHex('hwb(120 49.9% 24.9%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hwb, hwb(0 100% 0%), hwb(0 0% 100%))');
      assert.strictEqual(res, '#7f7f7f', 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hwb, hwb(120 10% 20%), hwb(30 30% 40%))');
      const value = await mjs.convertColorToHex('hwb(75 20% 30%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hwb, hwb(120 10% 20%) 25%, hwb(30 30% 40%))');
      const value = await mjs.convertColorToHex('hwb(52.5 25% 35%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hwb, hwb(120 10% 20%), hwb(30 30% 40%) 25%)');
      const value = await mjs.convertColorToHex('hwb(97.5 15% 25%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20%) 25%, hwb(30 30% 40%) 75%)');
      const value = await mjs.convertColorToHex('hwb(52.5 25% 35%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20%) 30%, hwb(30 30% 40%) 90%)');
      const value = await mjs.convertColorToHex('hwb(52.5 25% 35%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20%) 12.5%, hwb(30 30% 40%) 37.5%)', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hwb(52.5 25% 35% / 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in hwb, hwb(120 10% 20%) 0%, hwb(30 30% 40%))');
      const value = await mjs.convertColorToHex('hwb(30 30% 40%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4), hwb(30 30% 40% / .8))', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hwb(75 23.33% 33.33% / 0.6)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20%) 25%, hwb(30 30% 40% / .8))', {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('hwb(52.5 24.117647% 34.117647% / 0.85)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4), hwb(30 30% 40% / .8) 25%)', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hwb(97.5 18% 28% / 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4) 25%, hwb(30 30% 40% / .8) 75%)', {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('hwb(52.5 27.14% 37.14% / 0.7)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4) 30%, hwb(30 30% 40% / .8) 90%)', {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('hwb(52.5 27.14% 37.14% / 0.7)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4) 12.5%, hwb(30 30% 40% / .8) 37.5%)', {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('hwb(52.5 27.14% 37.14% / 0.35)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4) 0%, hwb(30 30% 40% / .8))', {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hwb(30 30% 40% / 0.8)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in lab, red, green)');
      const value =
        await mjs.convertColorToHex('lab(50.284 16.626 59.2386)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in lab, color(srgb 1 0 0), color(srgb 0 0.5 0))');
      const value =
        await mjs.convertColorToHex('lab(50.284 16.626 59.2386)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in lab, red, green 90%)');
      const value =
        await mjs.convertColorToHex('lab(47.07899 -34.716675 50.71676)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in lab, red 90%, green)');
      const value =
        await mjs.convertColorToHex('lab(53.489 67.969 67.7605)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in lch, red, green)');
      const value = await mjs.convertColorToHex('lch(50.28% 87.41 87.62)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res =
        await func('color-mix(in lch, color(srgb 1 0 0), color(srgb 0 0.5 0))');
      const value = await mjs.convertColorToHex('lch(50.28% 87.41 87.62)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in lch, red, green 90%)');
      const value = await mjs.convertColorToHex('lch(47.08% 71.87 125.03)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in lch, red 90%, green)');
      const value = await mjs.convertColorToHex('lch(53.49 102.95 50.21)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in oklab, red, green)');
      const value =
        await mjs.convertColorToHex('oklab(0.573853594 0.04228 0.116761 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in oklab, color(srgb 1 0 0), color(srgb 0 0.5 0))');
      const value =
        await mjs.convertColorToHex('oklab(0.573853594 0.04228 0.116761 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in oklab, red, green 90%)');
      const value =
        await mjs.convertColorToHex('oklab(0.53057 -0.104 0.10949 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in oklab, red 90%, green)');
      const value =
        await mjs.convertColorToHex('oklab(0.6171 0.1883 0.124 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in oklch, red, green)');
      const value =
        await mjs.convertColorToHex('oklch(0.58 0.2187445576 84.3177 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in oklch, color(srgb 1 0 0), color(srgb 0 0.5 0))');
      const value =
        await mjs.convertColorToHex('oklch(0.5791 0.21874 84.3177 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in oklch, red, green 90%)');
      const value =
        await mjs.convertColorToHex('oklch(0.533387 0.18065 127.843 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in oklch, red 90%, green)');
      const value =
        await mjs.convertColorToHex('oklch(0.6264 0.2568 40.792 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, color(srgb 0 0.5 0), color(srgb 1 0 1))');
      assert.strictEqual(res, '#804080', 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)'; // rgb(77, 128, 179)
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('rgb(134.5, 128, 121.5)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(none 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('rgb(77, 128, 121.5)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb none 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('rgb(192, 128, 121.5)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(none 128 64 / 1)';
      const colorB = 'color(srgb none 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('rgb(0, 128, 121.5)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 none 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('rgb(134.5, 127, 121.5)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 none 0.7 / 1)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('rgb(134.5, 128, 121.5)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 none 64 / 1)';
      const colorB = 'color(srgb 0.3 none 0.7 / 1)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('rgb(134.5, 0, 121.5)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 none / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('rgb(134.5, 128, 179)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 none / 1)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('rgb(134.5, 128, 64)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 none / 1)';
      const colorB = 'color(srgb 0.3 0.5 none / 1)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('rgb(134.5, 128, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / none)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgb(134.5, 128, 121.5)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / none)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('rgb(134.5, 128, 121.5)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / none)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / none)';
      const res = await func(`color-mix(in srgb, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('rgba(134.5, 127.5, 121.5, 0)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      // [0.5271151257058131, 0.21586050011389923, 0.05126945837404324, 1]
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      // [0.07421356838014963, 0.21586050011389923, 0.45078578283822346, 1]
      const res = await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`);
      const value = await mjs.convertLinearRgbToHex([
        0.30066434704298134,
        0.21586050011389923,
        0.2510276206061334,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(none 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`);
      const value = await mjs.convertLinearRgbToHex([
        0.07421356838014963,
        0.21586050011389923,
        0.2510276206061334,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb none 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`);
      const value = await mjs.convertLinearRgbToHex([
        0.5271151257058131,
        0.21586050011389923,
        0.2510276206061334,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(none 128 64 / 1)';
      const colorB = 'color(srgb none 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`);
      const value = await mjs.convertLinearRgbToHex([
        0,
        0.21586050011389923,
        0.2510276206061334,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 none 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`);
      const value = await mjs.convertLinearRgbToHex([
        0.30028,
        0.21404,
        0.2496289,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 none 0.7 / 1)';
      const res = await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`);
      const value = await mjs.convertLinearRgbToHex([
        0.30066434704298134,
        0.21586050011389923,
        0.2510276206061334,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 none 64 / 1)';
      const colorB = 'color(srgb 0.3 none 0.7 / 1)';
      const res = await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`);
      const value = await mjs.convertLinearRgbToHex([
        0.30066434704298134,
        0,
        0.2510276206061334,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 none / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`);
      const value = await mjs.convertLinearRgbToHex([
        0.30066434704298134,
        0.21586050011389923,
        0.45078578283822346,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 none / 1)';
      const res = await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`);
      const value = await mjs.convertLinearRgbToHex([
        0.30066434704298134,
        0.21586050011389923,
        0.05126945837404324,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 none / 1)';
      const colorB = 'color(srgb 0.3 0.5 none / 1)';
      const res = await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`);
      const value = await mjs.convertLinearRgbToHex([
        0.30066434704298134,
        0.21586050011389923,
        0,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / none)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res =
        await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`, {
          alpha: true
        });
      const value = await mjs.convertLinearRgbToHex([
        0.30066434704298134,
        0.21586050011389923,
        0.2510276206061334,
        1
      ], {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / none)';
      const res =
        await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`, {
          alpha: true
        });
      const value = await mjs.convertLinearRgbToHex([
        0.30066434704298134,
        0.21586050011389923,
        0.2510276206061334,
        1
      ], {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / none)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / none)';
      const res =
        await func(`color-mix(in srgb-linear, ${colorA}, ${colorB})`, {
          alpha: true
        });
      const value = await mjs.convertLinearRgbToHex([
        0.300177,
        0.21495,
        0.2496289,
        0
      ], {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzToHex([
        0.24648520759776654,
        0.23643190167188327,
        0.2701513572532229,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(none 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzToHex([
        0.18759,
        0.17953,
        0.2636,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb none 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzToHex([
        0.3038,
        0.22779,
        0.267996,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(none 128 64 / 1)';
      const colorB = 'color(srgb none 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzToHex([
        0,
        0.17249893381565695,
        0.26433926926629325,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 none 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzToHex([
        0.2078910404316155,
        0.20270063746192896,
        0.25728663486450587,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 none 0.7 / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzToHex([
        0.2074,
        0.27016,
        0.2559477,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 none 64 / 1)';
      const colorB = 'color(srgb 0.3 none 0.7 / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzToHex([
        0.16929687326546441,
        0,
        0.24442191247578887,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 none / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzToHex([
        0.2418586314636254,
        0.2345812712182268,
        0.4556504341787926,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 none / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzToHex([
        0.20527987,
        0.2194060,
        0.08465228,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 none / 1)';
      const colorB = 'color(srgb 0.3 0.5 none / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzToHex([
        0.200653,
        0.21755544,
        0,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / none)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertXyzToHex([
        0.24648520759776654,
        0.23643190167188327,
        0.2701513572532229,
        1
      ], {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / none)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertXyzToHex([
        0.24648520759776654,
        0.23643190167188327,
        0.2701513572532229,
        1
      ], {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / none)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / none)';
      const res = await func(`color-mix(in xyz, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertXyzToHex([
        0.24648520759776654,
        0.23643190167188327,
        0.2701513572532229,
        0
      ], {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzD50ToHex([
        0.2501650544900184,
        0.2368606099644367,
        0.20440109934622114,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(none 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzD50ToHex([
        0.17847275,
        0.1773755,
        0.19963745,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb none 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzD50ToHex([
        0.320331,
        0.227867677,
        0.2027973,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(none 128 64 / 1)';
      const colorB = 'color(srgb none 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzD50ToHex([
        0,
        0.16996483974353876,
        0.20021467769115614,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 none 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzD50ToHex([
        0.20783,
        0.196895455,
        0.19282919,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 none 0.7 / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzD50ToHex([
        0.2081829,
        0.275135,
        0.1929175,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 none 64 / 1)';
      const colorB = 'color(srgb 0.3 none 0.7 / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzD50ToHex([
        0.16661,
        0,
        0.182439499,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 none / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzD50ToHex([
        0.2464972770583964,
        0.23530663805066815,
        0.3438951958151572,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 none / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzD50ToHex([
        0.21791618794792156,
        0.22319734009826947,
        0.0649070028772851,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 none / 1)';
      const colorB = 'color(srgb 0.3 0.5 none / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`);
      const value = await mjs.convertXyzD50ToHex([
        0.21424841051629956,
        0.22164336818450092,
        0,
        1
      ]);
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / none)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / 1)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertXyzD50ToHex([
        0.2501650544900184,
        0.2368606099644367,
        0.20440109934622114,
        1
      ], {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / 1)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / none)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertXyzD50ToHex([
        0.2501650544900184,
        0.2368606099644367,
        0.20440109934622114,
        1
      ], {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'rgb(192 128 64 / none)';
      const colorB = 'color(srgb 0.3 0.5 0.7 / none)';
      const res = await func(`color-mix(in xyz-d50, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertXyzD50ToHex([
        0.2501650544900184,
        0.2368606099644367,
        0.20440109934622114,
        0
      ], {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hsl(85.69 48.2% 30.5%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'currentColor';
      const colorB = 'lch(70% 70 90 / 1)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hsl(51.38 86.6% 40.98%)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'currentColor';
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hsl(120 9.8% 20% / 1)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(none 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hsl(51.3 48.1% 30.55%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 none / 1)';
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hsl(120 54.9% 45.5%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(none 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 none / 1)';
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hsl(0 54.9% 45.5%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 none 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hsl(25.67 86.4% 30.6%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% none 90 / 1)';
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hsl(105.9 9.8% 43.5%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 none 20% / 1)';
      const colorB = 'lch(70% none 90 / 1)';
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hsl(0 0% 43.5%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% none / 1)';
      const colorB = 'lch(70% 70 90 / 1)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hsl(51.38 86.6% 40.98%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(none 70 90 / 1)';
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hsl(60 54.9% 20%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% none / 1)';
      const colorB = 'lch(none 70 90 / 1)';
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hsl(0 100% 0%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / 1)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hsl(85.69 48.2% 30.5%)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / none)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hsl(85.69 48.2% 30.5%)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / none)'; // hsl(51.38 86.6% 40.98% / 0)
      const res = await func(`color-mix(in hsl, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('hsl(85.69 48.2% 30.5% / 0)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('hwb(85.6653 11.8% 50.7% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(none 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('hwb(51.33 11.8% 50.7% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 none / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hwb(120 29.9% 39.02% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(none 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 none / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hwb(0 29.9% 39.02% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / 1)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hwb(85.665 11.8% 50.7% / 1)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / none)'; // hsl(51.38 86.6% 40.98% / 0)
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hwb(85.665 11.8% 50.7% / 1)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / none)'; // hsl(51.38 86.6% 40.98%)
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hwb(85.665 11.8% 50.7% / 0)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hwb(120 10% 20% / 1)';
      const colorB = 'hwb(30 30% 40% / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hwb(75 20% 30% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'currentColor';
      const colorB = 'hwb(30 30% 40% / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hwb(30 15% 70%)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hwb(120 10% 20% / 1)';
      const colorB = 'currentColor';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hwb(120 5% 60% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hwb(120 none 20% / 1)';
      const colorB = 'hwb(30 30% 40% / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hwb(75 15% 30% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hwb(120 10% 20% / 1)';
      const colorB = 'hwb(30 none 40% / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hwb(75 5% 30% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hwb(120 none 20% / 1)';
      const colorB = 'hwb(30  none 40% / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hwb(75 0% 30% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hwb(120 10% none / 1)';
      const colorB = 'hwb(30 30% 40% / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('hwb(75 20% 20% / 1)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hwb(120 10% 20% / 1)';
      const colorB = 'hwb(30 30% none / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hwb(75 20% 10.1% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hwb(120 10% none / 1)';
      const colorB = 'hwb(30 30% none / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('hwb(75 20% 0% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hwb(120 50% 50% / 1)';
      const colorB = 'hwb(30 30% 40% / 1)';
      const res = await func(`color-mix(in hwb, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('hwb(30 40% 45% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('lab(46.166 -3.0737 37.40635 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'currentColor';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('lab(70 0 70 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'currentColor';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('lab(22.332 -6.1474695 4.8127 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% none / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('lab(70 0 70 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(none 70 90 / 1)';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('lab(22.332 -6.147469558 4.8127 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% none / 1)';
      const colorB = 'lch(none 70 90 / 1)';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lab(0 0 0 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('lab(46.166 -3.0737 37.406 / 1)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / none)';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('lab(46.166 -3.0737 37.406 / 1)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / none)';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('lab(46.166 -3.0737 37.406 / 0)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'black';
      const colorB = 'white';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lab(50% 0% 0% / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'lab(50% 25.124% 37.64%)';
      const colorB = 'white';
      const res = await func(`color-mix(in lab, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lab(75 31.4 47.1 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(46.12 38.88 116 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'currentColor';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(70 70 90 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'currentColor';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(22.332 7.8 141.94 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% none / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(70 70 90 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(none 70 90 / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(22.332 7.807 141.94 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% none / 1)';
      const colorB = 'lch(none 70 90 / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(0 0 0 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 none 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('lch(45.574795 69.945 90.052 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% none 90 / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(46.157 7.8 141.94 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 none 20% / 1)';
      const colorB = 'lch(70% none 90 / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(45.6 0 0 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(none 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(45 37.5 90.1 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 none / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(46.166 38.9 141.94 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(none 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 none / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('lch(45.03 37.51 0 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('lch(46.12 38.88 116 / 1)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / none)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('lch(46.12 38.88 116 / 1)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / none)';
      const res = await func(`color-mix(in lch, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value = await mjs.convertColorToHex('lch(46.12 38.88 116 / 0)', {
        alpha: true
      });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0.532 -0.01913 0.080463 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'currentColor';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0.736 -0.0202 0.1483344 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'currentcolor';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0 -0.018 0.012592 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% none / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0.736 -0.020 0.1483344 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(none 70 90 / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0.328 -0.018 0.012592 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% none / 1)';
      const colorB = 'lch(none 70 90 / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('oklab(0 0 0 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 none 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0.5287 -0.01012 0.074 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% none 90 / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0.534687 -0.009 0.006296 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 none 20% / 1)';
      const colorB = 'lch(70% none 90 / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('oklab(0.5312 0 0 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(none 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0.524 -0.003165 0.0764 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 none / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0.5464 0.0987 0.00504696 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(none 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 none / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0.5385 0.114672 0.001 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('oklab(0.532 -0.0191 0.080463 / 1)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / none)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('oklab(0.532 -0.0191 0.080463 / 1)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / none)';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('oklab(0.532 -0.0191 0.080463 / 0)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'white';
      const colorB = 'black';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('oklab(0.498396 0 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'lab(50% 25.124% 37.64%)';
      const colorB = 'white';
      const res = await func(`color-mix(in oklab, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklab(0.78766 0.07926686 0.10096213 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklch(0.5353 0.093 105.5239 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'currentColor';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklch(0.74212 0.15659 92.136789 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'currentColor';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklch(0.3285 0.02946 118.911 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% none / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklch(0.742124 0.15659 92.13679 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(none 70 90 / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklch(0.3285 0.02946 118.911 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% none / 1)';
      const colorB = 'lch(none 70 90 / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('oklch(0 0 0 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 none 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklch(0.53176 0.15659 84.720389 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% none 90 / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklch(0.5353 0.02946 98.10749 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 none 20% / 1)';
      const colorB = 'lch(70% none 90 / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value = await mjs.convertColorToHex('oklch(0.531748 0 0 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(none 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklch(0.5275 0.09076 92.13679 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 none / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklch(0.54915 0.1256 118.911 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(none 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 none / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`);
      const value =
        await mjs.convertColorToHex('oklch(0.54135 0.12337 0 / 1)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / 1)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('oklch(0.5353 0.093029 105.5239 / 1)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / 1)';
      const colorB = 'lch(70% 70 90 / none)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('oklch(0.5353 0.093029 105.5239 / 1)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });

    it('should get value', async () => {
      const colorA = 'hsl(120 9.8% 20% / none)';
      const colorB = 'lch(70% 70 90 / none)';
      const res = await func(`color-mix(in oklch, ${colorA}, ${colorB})`, {
        alpha: true
      });
      const value =
        await mjs.convertColorToHex('oklch(0.5353 0.093029 105.5239 / 0)', {
          alpha: true
        });
      assert.strictEqual(res, value, 'result');
    });
  });

  describe('get color in hexadecimal color syntax', () => {
    const func = mjs.getColorInHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should get null', async () => {
      const res = await func('transparent');
      assert.isNull(res, 'result');
    });

    it('should get value', async () => {
      const res = await func('green');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func(' GREEN ');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(0% 50% 0% / 0.5)', {
        alpha: true
      });
      assert.strictEqual(res, '#00800080', 'result');
    });

    it('should get value', async () => {
      const res = await func('color-mix(in srgb, blue, red)');
      const value = await mjs.convertColorToHex('rgb(128, 0, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get array', async () => {
      const res = await func('color-mix(in srgb, blue, red)', {
        alpha: true,
        prop: 'foo'
      });
      const value = await mjs.convertColorToHex('rgb(128, 0, 128)');
      assert.deepEqual(res, ['foo', value], 'result');
    });

    it('should get value', async () => {
      const res = await func('color(srgb 0 0.5 0)');
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('currentColor', {
        currentColor: 'green'
      });
      assert.strictEqual(res, '#008000', 'result');
    });

    it('should get value', async () => {
      const res = await func('currentColor', {
        alpha: true,
        currentColor: 'color(srgb 0 0.5 0 / 0.5)'
      });
      assert.strictEqual(res, '#00800080', 'result');
    });

    it('should get value', async () => {
      const res = await func('currentColor', {
        currentColor: 'color-mix(in srgb, blue, red)'
      });
      assert.strictEqual(res, '#800080', 'result');
    });

    it('should get value', async () => {
      const res = await func('currentColor', {
        alpha: true
      });
      assert.strictEqual(res, '#00000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('currentColor');
      assert.strictEqual(res, '#000000', 'result');
    });
  });

  describe('composite two layered colors', () => {
    const func = mjs.compositeLayeredColors;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func('foo').catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should get null', async () => {
      const res = await func('foo', 'bar');
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const res = await func('foo', 'black');
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const res = await func('black', 'foo');
      assert.isNull(res, 'result');
    });

    it('should get value', async () => {
      const res = await func('#00000000', 'black');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('#ff0000', 'black');
      assert.strictEqual(res, '#ff0000', 'result');
    });

    it('should get value', async () => {
      const res = await func('#ff000000', '#0000ff00');
      assert.strictEqual(res, '#0000ff00', 'result');
    });

    it('should get value', async () => {
      const res = await func('#0000ff11', '#0000ff');
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff11', '#000000');
      assert.strictEqual(res, '#111111', 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff22', '#000000');
      assert.strictEqual(res, '#222222', 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff33', '#000000');
      assert.strictEqual(res, '#333333', 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff66', '#000000');
      assert.strictEqual(res, '#666666', 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff99', '#000000');
      assert.strictEqual(res, '#999999', 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffffcc', '#000000');
      assert.strictEqual(res, '#cccccc', 'result');
    });

    it('should get value', async () => {
      const res = await func('#0c0c0d1a', '#0a84ff');
      assert.strictEqual(res, '#0a78e6', 'result');
    });

    it('should get value', async () => {
      const res = await func('#d7d7db1a', '#0a84ff');
      assert.strictEqual(res, '#1f8cfb', 'result');
    });

    it('should get value', async () => {
      const res = await func('#d7d7db33', '#0a84ff');
      assert.strictEqual(res, '#3395f8', 'result');
    });

    it('should get value', async () => {
      const res = await func('#f9f9fa1a', '#0a84ff');
      assert.strictEqual(res, '#2290fe', 'result');
    });

    it('should get value', async () => {
      const res = await func('#2a2a2e1a', '#0a84ff');
      assert.strictEqual(res, '#0d7bea', 'result');
    });

    it('should get value', async () => {
      const res = await func('#2a2a2e33', '#0a84ff');
      assert.strictEqual(res, '#1072d5', 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff11', '#000000ee');
      assert.strictEqual(res, '#121212ef', 'result');
    });

    it('should get value', async () => {
      const res = await func('#66669999', '#15141a');
      assert.strictEqual(res, '#464566', 'result');
    });

    it('should get value', async () => {
      const res = await func('#cc663399', '#15141a');
      assert.strictEqual(res, '#834529', 'result');
    });

    it('should get value', async () => {
      const res = await func('#33996699', '#15141a');
      assert.strictEqual(res, '#276448', 'result');
    });

    it('should get value', async () => {
      const res = await func('#cc669999', '#15141a');
      assert.strictEqual(res, '#834566', 'result');
    });

    it('should get value', async () => {
      const res = await func('#6699cc99', '#15141a');
      assert.strictEqual(res, '#466485', 'result');
    });

    it('should get value', async () => {
      const res = await func('#66669999', '#f9f9fa');
      assert.strictEqual(res, '#a1a1c0', 'result');
    });

    it('should get value', async () => {
      const res = await func('#cc663399', '#f9f9fa');
      assert.strictEqual(res, '#dea183', 'result');
    });

    it('should get value', async () => {
      const res = await func('#33996699', '#f9f9fa');
      assert.strictEqual(res, '#82bfa1', 'result');
    });

    it('should get value', async () => {
      const res = await func('#cc669999', '#f9f9fa');
      assert.strictEqual(res, '#dea1c0', 'result');
    });

    it('should get value', async () => {
      const res = await func('#6699cc99', '#f9f9fa');
      assert.strictEqual(res, '#a1bfde', 'result');
    });

    it('should get value', async () => {
      const res = await func('#6699cc66', '#6699cc99');
      assert.strictEqual(res, '#6699ccc2', 'result');
    });

    it('should get value', async () => {
      const res = await func('#6699cc99', '#6699cc66');
      assert.strictEqual(res, '#6699ccc2', 'result');
    });

    it('should get value', async () => {
      const overlay = 'color(srgb 0 0.5 0 / 0.4)';
      const base = 'color-mix(in srgb, white, blue)';
      const res = await func(overlay, base);
      assert.strictEqual(res, '#4d8099', 'result');
    });

    // active tab border mixed color of the default theme
    it('should get value', async () => {
      const res = await func('rgba(128,128,142,0.4)', '#fff');
      assert.strictEqual(res, '#ccccd2', 'result');
    });
  });
});
