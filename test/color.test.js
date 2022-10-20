/**
 * color.test.js
 */

/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';

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
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
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

    it('should get value', async () => {
      const res = await func(0);
      assert.strictEqual(res, '00', 'result');
    });

    it('should get value', async () => {
      const res = await func(16);
      assert.strictEqual(res, '10', 'result');
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

  describe('hex to hsl', () => {
    const func = mjs.hexToHsl;

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

    it('should get value', async () => {
      const res = await func('#ffffff');
      assert.deepEqual(res, [0, 0, 100, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#000000');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ff0000');
      assert.deepEqual(res, [0, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#00ff00');
      assert.deepEqual(res, [120, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#0000ff');
      assert.deepEqual(res, [240, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ff00ff');
      assert.deepEqual(res, [300, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffff00');
      assert.deepEqual(res, [60, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#00ffff');
      assert.deepEqual(res, [180, 100, 50, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#008000');
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [120, 100, 25, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#12345666');
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [210, 65, 20, 0.4]);
    });

    it('should get value', async () => {
      const res = await func('#545c3d');
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [75, 20, 30, 1], 'result');
    });
  });

  describe('hex to hwb', () => {
    const func = mjs.hexToHwb;

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

    it('should get value', async () => {
      const res = await func('#ffffff');
      assert.deepEqual(res, [0, 100, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#000000');
      assert.deepEqual(res, [0, 0, 100, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#808080');
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [0, 50, 50, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#408000');
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [90, 0, 50, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#608040');
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [90, 25, 50, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#bfff80');
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [90, 50, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#9fbf80');
      res[0] = Math.round(res[0]);
      res[1] = Math.round(res[1]);
      res[2] = Math.round(res[2]);
      assert.deepEqual(res, [90, 50, 25, 1], 'result');
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

  describe('hex to lab', () => {
    const func = mjs.hexToLab;

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
      const res = await func('#008000');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      assert.deepEqual(res, [46.28, -47.55, 48.59, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#000000');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff');
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [100, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(75.6208% 30.4487% 47.5634%)', true);
      const res = await func(value);
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [50, 50, 0, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(10.751% 75.558% 66.398%)', true);
      const res = await func(value);
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [70, -45, 0, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(76.6254% 66.3607% 5.5775%)', true);
      const res = await func(value);
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [70, 0, 70, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(12.8128% 53.105% 92.7645%)', true);
      const res = await func(value);
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [55, 0, -60, 1], 'result');
    });

    it('should get value', async () => {
      const value = await mjs.convertColorToHex('rgb(12.8128% 53.105% 92.7645% / 0.4)', true);
      const res = await func(value);
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [55, 0, -60, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('#7654cd');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      assert.deepEqual(res, [44.36, 36.05, -58.99, 1], 'result');
    });
  });

  describe('hex to lch', () => {
    const func = mjs.hexToLch;

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
      const res = await func('#008000');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(1));
      assert.deepEqual(res, [46.278, 68.0, 134.4, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#000000');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff');
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [100, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(75.6208% 30.4487% 47.5634%)', true);
      const res = await func(value);
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [50, 50, 0, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(10.7906% 75.5567% 66.3982%)', true);
      const res = await func(value);
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [70, 45, 180, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(76.6254% 66.3607% 5.5775%)', true);
      const res = await func(value);
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [70, 70, 90, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(12.8128% 53.105% 92.7645%)', true);
      const res = await func(value);
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [55, 60, 270, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(12.8128% 53.105% 92.7645%)', true);
      const res = await func(value);
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [55, 60, 270, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#7654cd');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      assert.deepEqual(res, [44.36, 69.13, 301.43, 1], 'result');
    });
  });

  describe('hex to oklab', () => {
    const func = mjs.hexToOklab;

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
      const res = await func('#008000');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(2));
      assert.deepEqual(res, [0.52, -0.15, 0.11, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#000000');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff');
      res[0] = parseFloat(Math.round(res[0]));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [1, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(48.477% 34.29% 38.412%)', true);
      const res = await func(value);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [0.5, 0.04, 0, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(29.264% 70.096% 63.017%)', true);
      const res = await func(value);
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [0.7, -0.1, 0, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(73.942% 60.484% 19.65%)', true);
      const res = await func(value);
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(res[2].toFixed(1));
      assert.deepEqual(res, [0.7, 0, 0.1, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(27.888% 38.072% 89.414%)', true);
      const res = await func(value);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(Math.round(res[1]));
      res[2] = parseFloat(res[2].toFixed(1));
      assert.deepEqual(res, [0.55, 0, -0.2, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#7654cd');
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(1));
      assert.deepEqual(res, [0.5, 0.0, -0.2, 1], 'result');
    });
  });

  describe('hex to oklch', () => {
    const func = mjs.hexToOklch;

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
      const res = await func('#008000');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(1));
      assert.deepEqual(res, [0.52, 0.18, 142.5, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#000000');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ffffff');
      assert.deepEqual(res, [1, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(70.492% 2.351% 37.073%)', true);
      const res = await func(value);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [0.5, 0.2, 360, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(23.056% 31.73% 82.628%)', true);
      const res = await func(value);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [0.5, 0.2, 270, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(32.022% 85.805% 61.147%)', true);
      const res = await func(value);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [0.8, 0.2, 160, 1], 'result');
    });

    it('should get value', async () => {
      const value =
        await mjs.convertColorToHex('rgb(67.293% 27.791% 52.28%)', true);
      const res = await func(value);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(Math.round(res[2]));
      assert.deepEqual(res, [0.55, 0.15, 345, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#7654cd');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [0.544, 0.179, 292.365, 1], 'result');
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

    it('should get value', async () => {
      const res = await func('rgb(10% 20% 30% / 40%)');
      assert.deepEqual(res, [25.5, 51, 76.5, 0.4], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(.1% .2% .3%)');
      assert.deepEqual(res, [0.255, 0.51, 0.765, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(.1% .2% .3% / .4)');
      assert.deepEqual(res, [0.255, 0.51, 0.765, 0.4], 'result');
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
      await func('hsl(1, 2, 3 / 1)').catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message,
          'Invalid property value: hsl(1, 2, 3 / 1)',
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
      const res = await func('lab(50 50 0)');
      const val =
        await mjs.convertColorToHex('rgb(75.6208% 30.4487% 47.5634%)', true)
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
        await mjs.convertColorToHex('rgb(10.751% 75.558% 66.398%)', true)
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
        await mjs.convertColorToHex('rgb(76.6254% 66.3607% 5.5775%)', true)
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
        await mjs.convertColorToHex('rgb(12.8128% 53.105% 92.7645%)', true)
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
        await mjs.convertColorToHex('rgb(75.6208% 30.4487% 47.5634%)', true)
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
        await mjs.convertColorToHex('rgb(10.7906% 75.5567% 66.3982%)', true)
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
        await mjs.convertColorToHex('rgb(76.6254% 66.3607% 5.5775%)', true)
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
        await mjs.convertColorToHex('rgb(12.8128% 53.105% 92.7645%)', true)
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
      const res = await func('oklab(0.52 -0.15 0.11)');
      const val = await mjs.hexToXyz('#008000');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(res[2].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(1));
      val[2] = parseFloat(val[2].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0 0 0)');
      assert.deepEqual(res, [0, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(1 0 0)');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      assert.deepEqual(res, [1.000, 1.000, 1.000, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.5 0.04 0)');
      const val =
        await await mjs.convertColorToHex('rgb(48.477% 34.29% 38.412%)', true)
          .then(mjs.hexToXyz);
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.7 -0.1 0)');
      const val =
        await await mjs.convertColorToHex('rgb(29.264% 70.096% 63.017%)', true)
          .then(mjs.hexToXyz);
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.7 0 0.1)');
      const val =
        await await mjs.convertColorToHex('rgb(73.942% 60.484% 19.65%)', true)
          .then(mjs.hexToXyz);
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.55 0 -0.2)');
      const val =
        await await mjs.convertColorToHex('rgb(27.888% 38.072% 89.414%)', true)
          .then(mjs.hexToXyz);
      res[0] = parseFloat(res[0].toFixed(1));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(0));
      val[0] = parseFloat(val[0].toFixed(1));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(0));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54166 0.03535 -0.18015)');
      const val = await mjs.hexToXyz('#7654cd');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54166 0.03535 -0.18015 / 1)');
      const val = await mjs.hexToXyz('#7654cd');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54166 0.03535 -0.18015 / .5)');
      const val = await mjs.hexToXyz('#7654cd80');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54166 0.03535 -0.18015 / 50%)');
      const val = await mjs.hexToXyz('#7654cd80');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(3));
      res[3] = parseFloat(res[3].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(3));
      val[3] = parseFloat(val[3].toFixed(1));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(.5% 20% 30%)');
      const val = await mjs.hexToXyz('#000400');
      res[0] = parseFloat(Math.abs(res[0].toFixed(1)));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(Math.abs(res[2].toFixed(1)));
      val[0] = parseFloat(Math.abs(val[0].toFixed(1)));
      val[1] = parseFloat(val[1].toFixed(1));
      val[2] = parseFloat(Math.abs(val[2].toFixed(1)));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(-10% 20% 30%)');
      const val = await mjs.hexToXyz('#000400');
      res[0] = parseFloat(Math.abs(res[0].toFixed(1)));
      res[1] = parseFloat(res[1].toFixed(1));
      res[2] = parseFloat(Math.abs(res[2].toFixed(1)));
      val[0] = parseFloat(Math.abs(val[0].toFixed(1)));
      val[1] = parseFloat(val[1].toFixed(1));
      val[2] = parseFloat(Math.abs(val[2].toFixed(1)));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(10% 20% .5%)');
      const val = await mjs.hexToXyz('#150002');
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(2));
      res[2] = parseFloat(res[2].toFixed(3));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(2));
      val[2] = parseFloat(val[2].toFixed(3));
      assert.deepEqual(res, val, 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(10% .5% 30%)');
      const val = await mjs.hexToXyz('#120000');
      res[0] = parseFloat(res[0].toFixed(3));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(Math.abs(res[2].toFixed(0)));
      val[0] = parseFloat(val[0].toFixed(3));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(Math.abs(val[2].toFixed(0)));
      assert.deepEqual(res, val, 'result');
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
      res[0] = parseFloat(res[0].toFixed(2));
      res[1] = parseFloat(res[1].toFixed(3));
      res[2] = parseFloat(res[2].toFixed(1));
      val[0] = parseFloat(val[0].toFixed(2));
      val[1] = parseFloat(val[1].toFixed(3));
      val[2] = parseFloat(val[2].toFixed(1));
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
        await mjs.convertColorToHex('rgb(70.492% 2.351% 37.073%)', true)
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
        await mjs.convertColorToHex('rgb(23.056% 31.73% 82.628%)', true)
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
        await mjs.convertColorToHex('rgb(32.022% 85.805% 61.147%)', true)
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
        await mjs.convertColorToHex('rgb(67.293% 27.791% 52.28%)', true)
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
  });

  describe('convert linear rgb to hex', () => {
    const func = mjs.convertLinearRgbToHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([-1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1.1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '1.1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, -1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1.1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '1.1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, -1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1.1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '1.1 is not between 0 and 1.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
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

  describe('convert xyz to hex', () => {
    const func = mjs.convertXyzToHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
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

  describe('convert xyz D50 to hex', () => {
    const func = mjs.convertXyzD50ToHex;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1]).catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'error message');
      });
    });

    it('should throw', async () => {
      await func([1, 1, 1, Number.NaN]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'NaN is not a number.',
          'error message');
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

  describe('convert color to hex', () => {
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

    it('should warn', async () => {
      const stubWarn = sinon.stub(console, 'warn');
      const res = await func('currentColor');
      const { calledOnce: warnCalled } = stubWarn;
      stubWarn.restore();
      assert.isTrue(warnCalled, 'called');
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const res = await func('transparent');
      assert.isNull(res, 'result');
    });

    it('should get value', async () => {
      const res = await func('transparent', true);
      assert.strictEqual(res, '#00000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('black');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('red', true);
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
      const res = await func('#abcdef', true);
      assert.strictEqual(res, '#abcdef', 'result');
    });

    it('should get value', async () => {
      const res = await func('#12345678');
      assert.strictEqual(res, '#123456', 'result');
    });

    it('should get value', async () => {
      const res = await func('#abcdef12', true);
      assert.strictEqual(res, '#abcdef12', 'result');
    });

    it('should get value', async () => {
      const res = await func('#1234');
      assert.strictEqual(res, '#112233', 'result');
    });

    it('should get value', async () => {
      const res = await func('#abcd', true);
      assert.strictEqual(res, '#aabbccdd', 'result');
    });

    it('should get value', async () => {
      const res = await func('#123');
      assert.strictEqual(res, '#112233', 'result');
    });

    it('should get value', async () => {
      const res = await func('#abc', true);
      assert.strictEqual(res, '#aabbcc', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(1 2 3 / 0.5)');
      assert.strictEqual(res, '#010203', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(10 20 30 / 0.5)', true);
      assert.strictEqual(res, '#0a141e80', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(0 0 0 / 1%)', true);
      assert.strictEqual(res, '#00000003', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(1,2,3,0.5)');
      assert.strictEqual(res, '#010203', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(1,2,3,0.5)', true);
      assert.strictEqual(res, '#01020380', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(1,2,3,1)', true);
      assert.strictEqual(res, '#010203', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgb(46.27% 32.94% 80.39%)', true);
      assert.strictEqual(res, '#7654cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(240 100% 50% / 0.5)');
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(-120deg 100% 50% / 0.5)', true);
      assert.strictEqual(res, '#0000ff80', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsl(120 100% 0% / 1%)', true);
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
      const res = await func('hsla(180,50%,50%,0.5)', true);
      assert.strictEqual(res, '#40bfbf80', 'result');
    });

    it('should get value', async () => {
      const res = await func('hsla(180,50%,50%,1)', true);
      assert.strictEqual(res, '#40bfbf', 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(240 100% 50%)');
      assert.strictEqual(res, '#aaaaaa', 'result');
    });

    it('should get value', async () => {
      const res = await func('hwb(110 20% 30% / 40%)', true);
      assert.strictEqual(res, '#48b33366', 'result');
    });

    it('should get value', async () => {
      const res = await func('lab(44.36 36.05 -59 / 1)');
      assert.deepEqual(res, '#7654cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('lch(44.36% 69.13 301.43 / 1)');
      assert.deepEqual(res, '#7654cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('oklab(0.54166 0.03535 -0.18015 / 1)');
      assert.deepEqual(res, '#7654cd', 'result');
    });

    it('should get value', async () => {
      const res = await func('oklch(54.4% 0.179 292.365 / 1)');
      assert.deepEqual(res, '#7654cd', 'result');
    });

    // active tab border color of the default theme with alpha channel
    it('should get value', async () => {
      const res = await func('rgba(128,128,142,0.4)', true);
      assert.strictEqual(res, '#80808e66', 'result');
    });
  });

  describe('convert color-mix() to hex', () => {
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
      const stubWarn = sinon.stub(console, 'warn');
      const res = await func('color-mix(in srgb, currentcolor, red)');
      const { calledOnce: warnCalled } = stubWarn;
      stubWarn.restore();
      assert.isTrue(warnCalled, 'called');
      assert.isNull(res, 'result');
    });

    it('should warn', async () => {
      const stubWarn = sinon.stub(console, 'warn');
      const res = await func('color-mix(in srgb, blue, currentcolor)');
      const { calledOnce: warnCalled } = stubWarn;
      stubWarn.restore();
      assert.isTrue(warnCalled, 'called');
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb, blue, red)');
      const value = await mjs.convertColorToHex('rgb(128, 0, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb, blue, green)');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb, #0000ff, #008000)');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb, rgb(0 0 255), rgb(0 128 0))');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in srgb, hsl(240 100% 50%), hsl(120 100% 25%))');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in srgb, hwb(240 0% 0%), hwb(120 0% 50%))');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb, rgba(255, 0, 0, 0.2), red)');
      const value = await mjs.convertColorToHex('rgba(255, 0, 0, 0.6)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb, blue 80%, red 80%)');
      const value = await mjs.convertColorToHex('rgb(128, 0, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb, blue 10%, red)');
      const value = await mjs.convertColorToHex('rgb(230, 0, 26)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb, blue 100%, red)');
      const value = await mjs.convertColorToHex('rgb(0, 0, 255)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in srgb, rgba(0, 0, 255, 0.5) 100%, red)');
      const value = await mjs.convertColorToHex('rgb(0, 0, 255, 0.5)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in srgb, red, rgba(0, 0, 255, 0.5) 100%)');
      const value = await mjs.convertColorToHex('rgb(0, 0, 255, 0.5)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb, rgb(100% 0% 0% / 0.7) 25%, rgb(0% 100% 0% / 0.2))');
      const value =
        await mjs.convertColorToHex('rgb(53.846% 46.154% 0% / 0.325)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb, rgb(100% 0% 0% / 0.7) 20%, rgb(0% 100% 0% / 0.2) 60%)');
      const value =
        await mjs.convertColorToHex('rgb(53.846% 46.154% 0% / 0.26)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in srgb, blue, lab(46.2775% -47.5621 48.5837))');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in srgb, lab(46.2775% -47.5621 48.5837), blue)');
      const value = await mjs.convertColorToHex('rgb(0, 64, 128)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%), hsl(30 30% 40%))');
      const value = await mjs.convertColorToHex('rgb(84, 92, 61)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%) 25%, hsl(30 30% 40%))');
      const value = await mjs.convertColorToHex('rgb(112, 106, 67)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%), hsl(30 30% 40%) 25%)');
      const value = await mjs.convertColorToHex('rgb(61, 73, 54)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20%) 25%, hsl(30 30% 40%) 75%)');
      const value = await mjs.convertColorToHex('rgb(112, 106, 67)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20%) 30%, hsl(30 30% 40%) 90%)');
      const value = await mjs.convertColorToHex('rgb(112, 106, 67)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20%) 12.5%, hsl(30 30% 40%) 37.5%)');
      const value =
        await mjs.convertColorToHex('rgba(112, 106, 67, 0.5)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%) 0%, hsl(30 30% 40%))');
      const value = await mjs.convertColorToHex('rgb(133, 102, 71)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4), hsl(30 30% 40% / .8))');
      const value = await mjs.convertColorToHex('rgba(95, 105, 65, 0.6)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20%) 25%, hsl(30 30% 40% / .8))');
      const value =
        await mjs.convertColorToHex('rgba(108, 103, 66, 0.85)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4), hsl(30 30% 40% / .8) 25%)');
      const value = await mjs.convertColorToHex('rgba(68, 84, 59, 0.5)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4) 25%, hsl(30 30% 40% / .8) 75%)');
      const value =
        await mjs.convertColorToHex('rgba(121, 114, 69, 0.7)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4) 30%, hsl(30 30% 40% / .8) 90%)');
      const value =
        await mjs.convertColorToHex('rgba(121, 114, 69, 0.7)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4) 12.5%, hsl(30 30% 40% / .8) 37.5%)');
      const value =
        await mjs.convertColorToHex('rgba(121, 114, 69, 0.35)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hsl, hsl(120 10% 20% / .4) 0%, hsl(30 30% 40% / .8))');
      const value =
        await mjs.convertColorToHex('rgba(133, 102, 71, 0.8)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hwb, hwb(0 100% 0%), hwb(0 0% 100%))');
      assert.strictEqual(res, '#808080', 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hwb, hwb(120 10% 20%), hwb(30 30% 40%))');
      assert.strictEqual(res, '#93b334', 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hwb, hwb(120 10% 20%) 25%, hwb(30 30% 40%))');
      assert.strictEqual(res, '#a69940', 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hwb, hwb(120 10% 20%), hwb(30 30% 40%) 25%)');
      assert.strictEqual(res, '#60bf27', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20%) 25%, hwb(30 30% 40%) 75%)');
      assert.strictEqual(res, '#a69940', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20%) 30%, hwb(30 30% 40%) 90%)');
      assert.strictEqual(res, '#a69940', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20%) 12.5%, hwb(30 30% 40%) 37.5%)');
      assert.strictEqual(res, '#a6994080', 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hwb, hwb(120 10% 20%) 0%, hwb(30 30% 40%))');
      assert.strictEqual(res, '#99734d', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4), hwb(30 30% 40% / .8))');
      assert.strictEqual(res, '#8faa3c99', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20%) 25%, hwb(30 30% 40% / .8))');
      assert.strictEqual(res, '#a89b3ed9', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4), hwb(30 30% 40% / .8) 25%)');
      assert.strictEqual(res, '#62b82e80', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4) 25%, hwb(30 30% 40% / .8) 75%)');
      assert.strictEqual(res, '#a09546b3', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4) 30%, hwb(30 30% 40% / .8) 90%)');
      assert.strictEqual(res, '#a09546b3', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4) 12.5%, hwb(30 30% 40% / .8) 37.5%)');
      assert.strictEqual(res, '#a0954659', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in hwb, hwb(120 10% 20% / .4) 0%, hwb(30 30% 40% / .8))');
      assert.strictEqual(res, '#99734dcc', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, blue, red)');
      assert.strictEqual(res, '#bc00bc', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, blue, green)');
      assert.strictEqual(res, '#005cbc', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, #0000ff, #008000)');
      assert.strictEqual(res, '#005cbc', 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in srgb-linear, rgb(0 0 255), rgb(0 128 0))');
      assert.strictEqual(res, '#005cbc', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, hsl(240 100% 50%), hsl(120 100% 25%))');
      assert.strictEqual(res, '#005cbc', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, hwb(240 0% 0%), hwb(120 0% 50%))');
      assert.strictEqual(res, '#005cbc', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, rgba(255, 0, 0, 0.2), red)');
      assert.strictEqual(res, '#a2000099', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, blue 80%, red 80%)');
      assert.strictEqual(res, '#bc00bc', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, blue 10%, red)');
      assert.strictEqual(res, '#f30059', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, blue 100%, red)');
      assert.strictEqual(res, '#0000ff', 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in srgb-linear, rgba(0, 0, 255, 0.5) 100%, red)');
      assert.strictEqual(res, '#00008980', 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in srgb-linear, red, rgba(0, 0, 255, 0.5) 100%)');
      assert.strictEqual(res, '#00008980', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, rgb(100% 0% 0% / 0.7) 25%, rgb(0% 100% 0% / 0.2))');
      assert.strictEqual(res, '#443e0053', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in srgb-linear, rgb(100% 0% 0% / 0.7) 20%, rgb(0% 100% 0% / 0.2) 60%)');
      assert.strictEqual(res, '#443e0042', 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in xyz, red, green)');
      const value = await mjs.convertColorToHex('rgb(188, 92, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in xyz, red, green 90%)');
      const value = await mjs.convertColorToHex('rgb(89, 122, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in xyz, red 90%, green)');
      const value = await mjs.convertColorToHex('rgb(243, 40, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in xyz-d65, red, green)');
      const value = await mjs.convertColorToHex('rgb(188, 92, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in xyz-d65, red, green 90%)');
      const value = await mjs.convertColorToHex('rgb(89, 122, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in xyz-d65, red 90%, green)');
      const value = await mjs.convertColorToHex('rgb(243, 40, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in xyz-d50, red, green)');
      const value = await mjs.convertColorToHex('rgb(188, 92, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in xyz-d50, red, green 90%)');
      const value = await mjs.convertColorToHex('rgb(89, 122, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in xyz-d50, red 90%, green)');
      const value = await mjs.convertColorToHex('rgb(243, 40, 0)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in lab, red, green)');
      const value = await mjs.convertColorToHex('lab(50.2841 16.6263 59.2386)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in lab, red, green 90%)');
      const value =
        await mjs.convertColorToHex('lab(47.0790 -34.7167 50.7168)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in lab, red 90%, green)');
      const value = await mjs.convertColorToHex('lab(53.4893 67.9692 67.7605)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in lch, red, green)');
      const value = await mjs.convertColorToHex('lch(50.28% 87.41 87.62)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in lch, red, green 90%)');
      const value = await mjs.convertColorToHex('lch(47.08% 71.87 125.03)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in lch, red 90%, green)');
      const value = await mjs.convertColorToHex('lch(53.49 102.95 50.21)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in oklab, red, green)');
      const value = await mjs.convertColorToHex('oklab(0.5720 0.0287 0.1151)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in oklab, red, green 90%)');
      const value = await mjs.convertColorToHex('oklab(0.5293 -0.1131 0.1073)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in oklab, red 90%, green)');
      const value = await mjs.convertColorToHex('oklab(0.6147 0.1704 0.1230)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in oklch, red, green)');
      const value = await mjs.convertColorToHex('oklch(0.574 0.217 85.865)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in oklch, red, green 90%)');
      const value = await mjs.convertColorToHex('oklch(0.531 0.185 131.169)');
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res = await func('color-mix(in oklch, red 90%, green)');
      const value = await mjs.convertColorToHex('oklch(0.617 0.25 40.56)');
      assert.strictEqual(res, value, 'result');
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

    // active tab border mixed color of the default theme
    it('should get value', async () => {
      const res = await func('rgba(128,128,142,0.4)', '#fff');
      assert.strictEqual(res, '#ccccd2', 'result');
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
      const res = await func('black');
      assert.strictEqual(res, '#000000', 'result');
    });

    it('should get value', async () => {
      const res = await func('rgba(0 0 0 / 0)', {
        alpha: true
      });
      assert.strictEqual(res, '#00000000', 'result');
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
  });
});
