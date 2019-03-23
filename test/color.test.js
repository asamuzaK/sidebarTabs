/**
 * color.test.js
 */
/* eslint-disable no-magic-numbers, max-nested-callbacks */

import {assert} from "chai";
import {describe, it} from "mocha";
import * as mjs from "../src/mjs/color.js";

describe("color", () => {
  describe("colorname", () => {
    const obj = mjs.colorname;

    it("should get string", async () => {
      const items = Object.keys(obj);
      for (const key of items) {
        assert.isString(obj[key], "value");
      }
    });
  });

  describe("convert angle to deg", () => {
    const func = mjs.convertAngleToDeg;

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "error message");
      });
    });

    it("should get NaN if given argument is invalid", async () => {
      const res = await func("0foo");
      assert.isNaN(res, "result");
    });

    it("should get value", async () => {
      const res = await func("90");
      assert.strictEqual(res, 90, "result");
    });

    it("should get value", async () => {
      const res = await func("90deg");
      assert.strictEqual(res, 90, "result");
    });

    it("should get value", async () => {
      const res = await func("100grad");
      assert.strictEqual(res, 90, "result");
    });

    it("should get value", async () => {
      const res = await func(".25turn");
      assert.strictEqual(res, 90, "result");
    });

    it("should get value", async () => {
      const res = await func("1.57rad");
      assert.strictEqual(Math.round(res), 90, "result");
    });

    it("should get value", async () => {
      const res = await func("0deg");
      assert.strictEqual(res, 0, "result");
    });

    it("should get value", async () => {
      const res = await func("360deg");
      assert.strictEqual(res, 0, "result");
    });

    it("should get value", async () => {
      const res = await func("720deg");
      assert.strictEqual(res, 0, "result");
    });

    it("should get value", async () => {
      const res = await func("-90deg");
      assert.strictEqual(res, 270, "result");
    });
  });

  describe("parse hsl()", () => {
    const func = mjs.parseHsl;

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func("hsl(1, 2, 3 / 1)").catch(e => {
        assert.instanceOf(e, Error, "error");
        assert.strictEqual(e.message,
                           "Invalid property value: hsl(1, 2, 3 / 1)",
                           "error message");
      });
    });

    it("should get value", async () => {
      const res = await func("hsl(0 100% 50% / 40%)");
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.round(res[i]);
        i++;
      }
      assert.deepEqual(res, [255, 0, 0, 0.4], "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(0 .1% 50%)");
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.round(res[i]);
        i++;
      }
      assert.deepEqual(res, [128, 127, 127, 1], "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(0 .1% .1%)");
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.round(res[i]);
        i++;
      }
      assert.deepEqual(res, [0, 0, 0, 1], "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(60deg 100% 50% / .4)");
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.round(res[i]);
        i++;
      }
      assert.deepEqual(res, [255, 255, 0, 0.4], "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(120 100% 50%)");
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.round(res[i]);
        i++;
      }
      assert.deepEqual(res, [0, 255, 0, 1], "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(180 100% 50%)");
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.round(res[i]);
        i++;
      }
      assert.deepEqual(res, [0, 255, 255, 1], "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(240 100% 50%)");
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.round(res[i]);
        i++;
      }
      assert.deepEqual(res, [0, 0, 255, 1], "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(300 100% 50%)");
      const l = 3;
      let i = 0;
      while (i < l) {
        res[i] = Math.round(res[i]);
        i++;
      }
      assert.deepEqual(res, [255, 0, 255, 1], "result");
    });
  });

  describe("parse rgb()", () => {
    const func = mjs.parseRgb;

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func("rgb(1, 2, 3 / 1)").catch(e => {
        assert.instanceOf(e, Error, "error");
        assert.strictEqual(e.message,
                           "Invalid property value: rgb(1, 2, 3 / 1)",
                           "error message");
      });
    });

    it("should get value", async () => {
      const res = await func("rgb(10% 20% 30% / 40%)");
      assert.deepEqual(res, [25.5, 51, 76.5, 0.4], "result");
    });

    it("should get value", async () => {
      const res = await func("rgb(.1% .2% .3%)");
      assert.deepEqual(res, [0.255, 0.51, 0.765, 1], "result");
    });

    it("should get value", async () => {
      const res = await func("rgb(.1% .2% .3% / .4)");
      assert.deepEqual(res, [0.255, 0.51, 0.765, 0.4], "result");
    });
  });

  describe("parse hex", () => {
    const func = mjs.parseHex;

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func("white").catch(e => {
        assert.instanceOf(e, Error, "error");
        assert.strictEqual(e.message,
                           "Invalid property value: white",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func("#1").catch(e => {
        assert.instanceOf(e, Error, "error");
        assert.strictEqual(e.message,
                           "Invalid property value: #1",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func("#12").catch(e => {
        assert.instanceOf(e, Error, "error");
        assert.strictEqual(e.message,
                           "Invalid property value: #12",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func("#12345").catch(e => {
        assert.instanceOf(e, Error, "error");
        assert.strictEqual(e.message,
                           "Invalid property value: #12345",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func("#1234567").catch(e => {
        assert.instanceOf(e, Error, "error");
        assert.strictEqual(e.message,
                           "Invalid property value: #1234567",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func("#123456789").catch(e => {
        assert.instanceOf(e, Error, "error");
        assert.strictEqual(e.message,
                           "Invalid property value: #123456789",
                           "error message");
      });
    });

    it("should get value", async () => {
      const res = await func("#ff0000");
      assert.deepEqual(res, [255, 0, 0, 1], "result");
    });

    it("should get value", async () => {
      const res = await func("#ff0000ff");
      assert.deepEqual(res, [255, 0, 0, 1], "result");
    });

    it("should get value", async () => {
      const res = await func("#ff00001a");
      res[3] = parseFloat(res[3].toFixed(1));
      assert.deepEqual(res, [255, 0, 0, 0.1], "result");
    });

    it("should get value", async () => {
      const res = await func("#f001");
      res[3] = parseFloat(res[3].toFixed(1));
      assert.deepEqual(res, [255, 0, 0, 0.1], "result");
    });

    it("should get value", async () => {
      const res = await func("#f00");
      assert.deepEqual(res, [255, 0, 0, 1], "result");
    });
  });

  describe("number to hex string", () => {
    const func = mjs.numberToHexString;

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Undefined is not a Number.",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func(-1).catch(e => {
        assert.instanceOf(e, RangeError, "error");
        assert.strictEqual(e.message, "-1 is not between 0 and 255.",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func(256).catch(e => {
        assert.instanceOf(e, RangeError, "error");
        assert.strictEqual(e.message, "256 is not between 0 and 255.",
                           "error message");
      });
    });

    it("should get value", async () => {
      const res = await func(0);
      assert.strictEqual(res, "00", "result");
    });

    it("should get value", async () => {
      const res = await func(16);
      assert.strictEqual(res, "10", "result");
    });

    it("should get value", async () => {
      const res = await func(0.15 * 255);
      assert.strictEqual(res, "26", "result");
    });

    it("should get value", async () => {
      const res = await func(255);
      assert.strictEqual(res, "ff", "result");
    });
  });

  describe("convert color to hex", () => {
    const func = mjs.convertColorToHex;

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "error message");
      });
    });

    it("should get null", async () => {
      const res = await func("foo");
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      const res = await func("currentColor");
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      const res = await func("transparent");
      assert.isNull(res, "result");
    });

    it("should get value", async () => {
      const res = await func("transparent", true);
      assert.strictEqual(res, "#00000000", "result");
    });

    it("should get value", async () => {
      const res = await func("black");
      assert.strictEqual(res, "#000000", "result");
    });

    it("should get value", async () => {
      const res = await func("red", true);
      assert.strictEqual(res, "#ff0000", "result");
    });

    it("should get value", async () => {
      const res = await func("WHITE");
      assert.strictEqual(res, "#ffffff", "result");
    });

    it("should get value", async () => {
      const res = await func("#123456");
      assert.strictEqual(res, "#123456", "result");
    });

    it("should get value", async () => {
      const res = await func("#abcdef", true);
      assert.strictEqual(res, "#abcdef", "result");
    });

    it("should get value", async () => {
      const res = await func("#12345678");
      assert.strictEqual(res, "#123456", "result");
    });

    it("should get value", async () => {
      const res = await func("#abcdef12", true);
      assert.strictEqual(res, "#abcdef12", "result");
    });

    it("should get value", async () => {
      const res = await func("#1234");
      assert.strictEqual(res, "#112233", "result");
    });

    it("should get value", async () => {
      const res = await func("#abcd", true);
      assert.strictEqual(res, "#aabbccdd", "result");
    });

    it("should get value", async () => {
      const res = await func("#123");
      assert.strictEqual(res, "#112233", "result");
    });

    it("should get value", async () => {
      const res = await func("#abc", true);
      assert.strictEqual(res, "#aabbcc", "result");
    });

    it("should get value", async () => {
      const res = await func("rgb(1 2 3 / 0.5)");
      assert.strictEqual(res, "#010203", "result");
    });

    it("should get value", async () => {
      const res = await func("rgb(10 20 30 / 0.5)", true);
      assert.strictEqual(res, "#0a141e80", "result");
    });

    it("should get value", async () => {
      const res = await func("rgb(0 0 0 / 1%)", true);
      assert.strictEqual(res, "#00000003", "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(240 100% 50% / 0.5)");
      assert.strictEqual(res, "#0000ff", "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(-120deg 100% 50% / 0.5)", true);
      assert.strictEqual(res, "#0000ff80", "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(120 100% 0% / 1%)", true);
      assert.strictEqual(res, "#00000003", "result");
    });

    it("should get value", async () => {
      const res = await func("hsl(240 100% 50%)");
      assert.strictEqual(res, "#0000ff", "result");
    });
  });

  describe("blend two colors", () => {
    const func = mjs.blendColors;

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "error message");
      });
    });

    it("should throw", async () => {
      await func("foo").catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "error message");
      });
    });

    it("should get null", async () => {
      const res = await func("black", "foo");
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      const res = await func("foo", "black");
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      const res = await func("foo", "bar");
      assert.isNull(res, "result");
    });

    it("should get value", async () => {
      const res = await func("black", "#00000000");
      assert.strictEqual(res, "#000000", "result");
    });

    it("should get value", async () => {
      const res = await func("black", "#ff0000");
      assert.strictEqual(res, "#ff0000", "result");
    });

    it("should get value", async () => {
      const res = await func("#0000ff00", "#ff000000");
      assert.strictEqual(res, "#0000ff00", "result");
    });

    it("should get value", async () => {
      const res = await func("#0000ffff", "#0000ff11");
      assert.strictEqual(res, "#0000ffff", "result");
    });

    it("should get value", async () => {
      const res = await func("#000000ff", "#ffffff11");
      assert.strictEqual(res, "#111111ff", "result");
    });

    it("should get value", async () => {
      const res = await func("#000000ff", "#ffffff22");
      assert.strictEqual(res, "#222222ff", "result");
    });

    it("should get value", async () => {
      const res = await func("#000000ff", "#ffffff33");
      assert.strictEqual(res, "#333333ff", "result");
    });

    it("should get value", async () => {
      const res = await func("#000000ff", "#ffffff66");
      assert.strictEqual(res, "#666666ff", "result");
    });

    it("should get value", async () => {
      const res = await func("#000000ff", "#ffffff99");
      assert.strictEqual(res, "#999999ff", "result");
    });

    it("should get value", async () => {
      const res = await func("#000000ff", "#ffffffcc");
      assert.strictEqual(res, "#ccccccff", "result");
    });
  });
});
