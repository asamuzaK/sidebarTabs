/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';
import fs from 'fs';
import nock from 'nock';
import os from 'os';
import path from 'path';
import process from 'process';
import sinon from 'sinon';

/* test */
import {
  commander, createFile, fetchText, saveThemeManifest, updateManifests,
  parseCommand
} from '../modules/commander.js';

const BASE_URL = 'https://hg.mozilla.org';
const BASE_DIR = '/mozilla-central/raw-file/tip/browser/themes/addons/';
const TMPDIR = process.env.TMP || process.env.TMPDIR || process.env.TEMP ||
               os.tmpdir();

describe('createFile', () => {
  it('should get string', async () => {
    const dirPath = path.join(TMPDIR, 'sidebartabs');
    fs.mkdirSync(dirPath);
    const filePath = path.join(dirPath, 'test.txt');
    const value = 'test file.\n';
    const file = await createFile(filePath, value);
    assert.strictEqual(file, filePath);
    fs.unlinkSync(file);
    fs.rmdirSync(dirPath);
  });

  it('should throw if first argument is not a string', () => {
    createFile().catch(e => {
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it(
    'should throw if second argument is not a string', () => {
      const file = path.join(TMPDIR, 'sidebartabs', 'test.txt');
      createFile(file).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.');
      });
    }
  );
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

describe('save theme manifest file', () => {
  it('should throw', async () => {
    await saveThemeManifest().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should throw if file not found', async () => {
    const url = `${BASE_URL}${BASE_DIR}foo/manifest.json`;
    nock(BASE_URL).get(`${BASE_DIR}foo/manifest.json`).reply(404);
    await saveThemeManifest('foo').catch(e => {
      assert.instanceOf(e, Error, 'error');
      assert.strictEqual(e.message,
        `Network response was not ok. status: 404 url: ${url}`);
    });
    nock.cleanAll();
  });

  it('should get result', async () => {
    const dir = 'alpenglow';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    nock(BASE_URL).get(`${BASE_DIR}${dir}/manifest.json`).reply(200, '{}');
    const res = await saveThemeManifest(dir);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j, 'info');
    assert.strictEqual(res, filePath, 'result');
    nock.cleanAll();
  });

  it('should get result', async () => {
    const dir = 'alpenglow';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    nock(BASE_URL).get(`${BASE_DIR}${dir}/manifest.json`).reply(200, '{}');
    const res = await saveThemeManifest(dir, true);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j + 1, 'info');
    assert.strictEqual(res, filePath, 'result');
    nock.cleanAll();
  });

  it('should get result', async () => {
    const dir = 'dark';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    nock(BASE_URL).get(`${BASE_DIR}${dir}/manifest.json`).reply(200, '{}');
    const res = await saveThemeManifest(dir);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j, 'info');
    assert.strictEqual(res, filePath, 'result');
    nock.cleanAll();
  });

  it('should get result', async () => {
    const dir = 'dark';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    nock(BASE_URL).get(`${BASE_DIR}${dir}/manifest.json`).reply(200, '{}');
    const res = await saveThemeManifest(dir, true);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j + 1, 'info');
    assert.strictEqual(res, filePath, 'result');
    nock.cleanAll();
  });

  it('should get result', async () => {
    const dir = 'light';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    nock(BASE_URL).get(`${BASE_DIR}${dir}/manifest.json`).reply(200, '{}');
    const res = await saveThemeManifest(dir);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j, 'info');
    assert.strictEqual(res, filePath, 'result');
    nock.cleanAll();
  });

  it('should get result', async () => {
    const dir = 'light';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    nock(BASE_URL).get(`${BASE_DIR}${dir}/manifest.json`).reply(200, '{}');
    const res = await saveThemeManifest(dir, true);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j + 1, 'info');
    assert.strictEqual(res, filePath, 'result');
    nock.cleanAll();
  });
});

describe('update manifests', () => {
  it('should call function', async () => {
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        status: 'resolved'
      },
      {
        reason: new Error('error'),
        status: 'rejected'
      },
      {
        status: 'resolved'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    await updateManifests();
    const { callCount: traceCallCount } = stubTrace;
    stubAll.restore();
    stubTrace.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace');
  });

  it('should not call function', async () => {
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        status: 'resolved'
      },
      {
        status: 'resolved'
      },
      {
        status: 'resolved'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    await updateManifests();
    const { callCount: traceCallCount } = stubTrace;
    stubAll.restore();
    stubTrace.restore();
    assert.strictEqual(traceCallCount, i, 'trace');
  });

  it('should call function', async () => {
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        reason: new Error('error'),
        status: 'rejected'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const opt = {
      dir: 'alpenglow'
    };
    await updateManifests(opt);
    const { callCount: traceCallCount } = stubTrace;
    stubAll.restore();
    stubTrace.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace');
  });

  it('should not call function', async () => {
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        status: 'resolved'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const opt = {
      dir: 'alpenglow'
    };
    await updateManifests(opt);
    const { callCount: traceCallCount } = stubTrace;
    stubAll.restore();
    stubTrace.restore();
    assert.strictEqual(traceCallCount, i, 'trace');
  });
});

describe('parse command', () => {
  it('should not parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const i = stubParse.callCount;
    parseCommand();
    assert.strictEqual(stubParse.callCount, i, 'not called');
    stubParse.restore();
  });

  it('should not parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const i = stubParse.callCount;
    parseCommand([]);
    assert.strictEqual(stubParse.callCount, i, 'not called');
    stubParse.restore();
  });

  it('should not parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const i = stubParse.callCount;
    parseCommand(['foo', 'bar', 'baz']);
    assert.strictEqual(stubParse.callCount, i, 'not called');
    stubParse.restore();
  });

  it('should parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const stubVer = sinon.stub(commander, 'version');
    const i = stubParse.callCount;
    const j = stubVer.callCount;
    parseCommand(['foo', 'bar', '-v']);
    assert.strictEqual(stubParse.callCount, i + 1, 'called');
    assert.strictEqual(stubVer.callCount, j + 1, 'called');
    stubParse.restore();
    stubVer.restore();
  });
});
