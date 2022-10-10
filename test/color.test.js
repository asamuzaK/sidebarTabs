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

  describe('convert angle to deg', () => {
    const func = mjs.convertAngleToDeg;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'error message');
      });
    });

    it('should get NaN if given argument is invalid', async () => {
      const res = await func('0foo');
      assert.isNaN(res, 'result');
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
      const res = await func('720deg');
      assert.strictEqual(res, 0, 'result');
    });

    it('should get value', async () => {
      const res = await func('-90deg');
      assert.strictEqual(res, 270, 'result');
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

  describe('parse hex', () => {
    const func = mjs.parseHex;

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
      const res = await func('#ff0000ff');
      assert.deepEqual(res, [255, 0, 0, 1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#ff00001a');
      res[3] = parseFloat(res[3].toFixed(1));
      assert.deepEqual(res, [255, 0, 0, 0.1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#f001');
      res[3] = parseFloat(res[3].toFixed(1));
      assert.deepEqual(res, [255, 0, 0, 0.1], 'result');
    });

    it('should get value', async () => {
      const res = await func('#f00');
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

  describe('number to hex string', () => {
    const func = mjs.numberToHexString;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Undefined is not a Number.',
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
      const res =
        await func('color-mix(in srgb, rgb(0 0 255), rgb(0 128 0))');
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
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%) 25%, hsl(30 30% 40%) 75%)');
      const value = await mjs.convertColorToHex('rgb(112, 106, 67)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%) 30%, hsl(30 30% 40%) 90%)');
      const value = await mjs.convertColorToHex('rgb(112, 106, 67)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%) 12.5%, hsl(30 30% 40%) 37.5%)');
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
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20% / .4), hsl(30 30% 40% / .8))');
      const value = await mjs.convertColorToHex('rgba(95, 105, 65, 0.6)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20%) 25%, hsl(30 30% 40% / .8))');
      const value =
        await mjs.convertColorToHex('rgba(108, 103, 66, 0.85)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20% / .4), hsl(30 30% 40% / .8) 25%)');
      const value =
        await mjs.convertColorToHex('rgba(68, 84, 59, 0.5)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20% / .4) 25%, hsl(30 30% 40% / .8) 75%)');
      const value =
        await mjs.convertColorToHex('rgba(121, 114, 69, 0.7)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20% / .4) 30%, hsl(30 30% 40% / .8) 90%)');
      const value =
        await mjs.convertColorToHex('rgba(121, 114, 69, 0.7)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20% / .4) 12.5%, hsl(30 30% 40% / .8) 37.5%)');
      const value =
        await mjs.convertColorToHex('rgba(121, 114, 69, 0.35)', true);
      assert.strictEqual(res, value, 'result');
    });

    it('should get result', async () => {
      const res =
        await func('color-mix(in hsl, hsl(120 10% 20% / .4) 0%, hsl(30 30% 40% / .8))');
      const value =
        await mjs.convertColorToHex('rgba(133, 102, 71, 0.8)', true);
      assert.strictEqual(res, value, 'result');
    });

    // NOTE: not supported yet
    it('should get null', async () => {
      const res = await func('color-mix(in lch, blue, red)');
      assert.isNull(res, 'result');
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
