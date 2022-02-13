/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import fs from 'fs';
import nock from 'nock';
import os from 'os';
import path from 'path';

/* test */
import {
  createFile, fetchText, getStat, isFile, readFile
} from '../modules/file-util.js';

/* constants */
const TMPDIR = process.env.TMP || process.env.TMPDIR || process.env.TEMP ||
               os.tmpdir();

describe('getStat', () => {
  it('should be an object', () => {
    const p = path.resolve(path.join('test', 'file', 'test.txt'));
    assert.property(getStat(p), 'mode');
  });

  it('should get null if given argument is not string', () => {
    assert.isNull(getStat());
  });

  it('should get null if file does not exist', () => {
    const p = path.resolve(path.join('test', 'file', 'foo.txt'));
    assert.isNull(getStat(p));
  });
});

describe('isFile', () => {
  it('should get true if file exists', () => {
    const p = path.resolve(path.join('test', 'file', 'test.txt'));
    assert.isTrue(isFile(p));
  });

  it('should get false if file does not exist', () => {
    const p = path.resolve(path.join('test', 'file', 'foo.txt'));
    assert.isFalse(isFile(p));
  });
});

describe('readFile', () => {
  it('should throw', async () => {
    await readFile('foo/bar').catch(e => {
      assert.strictEqual(e.message, 'foo/bar is not a file.');
    });
  });

  it('should get file', async () => {
    const p = path.resolve(path.join('test', 'file', 'test.txt'));
    const opt = { encoding: 'utf8', flag: 'r' };
    const file = await readFile(p, opt);
    assert.strictEqual(file, 'test file\n');
  });
});

describe('createFile', () => {
  const dirPath = path.join(TMPDIR, 'sidebartabs');
  beforeEach(() => {
    fs.rmSync(dirPath, { force: true, recursive: true });
  });
  afterEach(() => {
    fs.rmSync(dirPath, { force: true, recursive: true });
  });

  it('should get string', async () => {
    fs.mkdirSync(dirPath);
    const filePath = path.join(dirPath, 'test.txt');
    const value = 'test file.\n';
    const file = await createFile(filePath, value);
    assert.strictEqual(file, filePath);
  });

  it('should throw if first argument is not a string', () => {
    createFile().catch(e => {
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should throw if second argument is not a string', () => {
    const file = path.join(dirPath, 'test.txt');
    createFile(file).catch(e => {
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });
});

describe('fetch text', () => {
  it('should throw', async () => {
    await fetchText().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should throw', async () => {
    const base = 'https://example.com';
    nock(base).get('/').reply(undefined);
    await fetchText(base).catch(e => {
      assert.instanceOf(e, Error, 'error');
      assert.strictEqual(e.message,
        `Network response was not ok. status: undefined url: ${base}`
      );
    });
    nock.cleanAll();
  });

  it('should throw', async () => {
    const base = 'https://example.com';
    nock(base).get('/').reply(404);
    await fetchText(base).catch(e => {
      assert.instanceOf(e, Error, 'error');
      assert.strictEqual(e.message,
        `Network response was not ok. status: 404 url: ${base}`);
    });
    nock.cleanAll();
  });

  it('should get result', async () => {
    const base = 'https://example.com';
    nock(base).get('/').reply(200, 'foo');
    const res = await fetchText('https://example.com');
    assert.strictEqual(res, 'foo', 'result');
    nock.cleanAll();
  });
});
