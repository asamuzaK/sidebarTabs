/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';
import fs, { promises as fsPromise } from 'fs';
import nock from 'nock';
import os from 'os';
import path from 'path';
import process from 'process';
import sinon from 'sinon';

/* test */
import {
  commander, createFile, fetchText, getStat, includeLibraries, isFile, readFile,
  saveLibraryPackage, saveThemeManifest, updateManifests, parseCommand
} from '../modules/commander.js';

const BASE_URL = 'https://hg.mozilla.org';
const BASE_DIR = '/mozilla-central/raw-file/tip/browser/themes/addons/';
const DIR_CWD = process.cwd();
const PATH_LIB = './src/lib';
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
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
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
    const j = stubWrite.callCount;
    await updateManifests();
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
  });

  it('should not call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
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
    const j = stubWrite.callCount;
    await updateManifests();
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        reason: new Error('error'),
        status: 'rejected'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const j = stubWrite.callCount;
    const opt = {
      dir: 'alpenglow'
    };
    await updateManifests(opt);
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
  });

  it('should not call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        status: 'resolved'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const j = stubWrite.callCount;
    const opt = {
      dir: 'alpenglow'
    };
    await updateManifests(opt);
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
  });
});

describe('save library package file', () => {
  it('should throw', async () => {
    await saveLibraryPackage().catch(e => {
      assert.instanceOf(e, TypeError);
      assert.strictEqual(e.message, 'Expected Array but got Undefined.');
    });
  });

  it('should throw', async () => {
    await saveLibraryPackage([]).catch(e => {
      assert.instanceOf(e, Error);
    });
  });

  it('should throw', async () => {
    await saveLibraryPackage([
      'foo'
    ]).catch(e => {
      assert.instanceOf(e, Error);
    });
  });

  it('should throw', async () => {
    await saveLibraryPackage([
      'foo',
      {
        name: 'foo'
      }
    ]).catch(e => {
      assert.instanceOf(e, Error);
    });
  });

  it('should throw', async () => {
    await saveLibraryPackage([
      'tldts',
      {
        name: 'tldts-experimental',
        origin: 'https://unpkg.com/tldts-experimental',
        files: [
          {
            file: 'foo',
            path: 'foo.txt'
          }
        ]
      }
    ]).catch(e => {
      const filePath = path.resolve(DIR_CWD, PATH_LIB, 'tldts', 'foo');
      assert.instanceOf(e, Error);
      assert.strictEqual(e.message, `${filePath} is not a file.`);
    });
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const filePath = path.resolve(DIR_CWD, PATH_LIB, 'tldts', 'package.json');
    const res = await saveLibraryPackage([
      'tldts',
      {
        name: 'tldts-experimental',
        origin: 'https://unpkg.com/tldts-experimental',
        files: [
          {
            file: 'LICENSE',
            path: 'LICENSE'
          },
          {
            file: 'index.esm.min.js',
            path: 'dist/index.esm.min.js'
          },
          {
            file: 'index.esm.min.js.map',
            path: 'dist/index.esm.min.js.map'
          }
        ]
      }
    ]);
    const { calledOnce: writeCalled } = stubWrite;
    stubWrite.restore();
    assert.isTrue(writeCalled, 'called');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const filePath = path.resolve(DIR_CWD, PATH_LIB, 'tldts', 'package.json');
    const res = await saveLibraryPackage([
      'tldts',
      {
        name: 'tldts-experimental',
        origin: 'https://unpkg.com/tldts-experimental',
        files: [
          {
            file: 'LICENSE',
            path: 'LICENSE'
          },
          {
            file: 'index.esm.min.js',
            path: 'dist/index.esm.min.js'
          },
          {
            file: 'index.esm.min.js.map',
            path: 'dist/index.esm.min.js.map'
          }
        ]
      }
    ], true);
    const { calledOnce: writeCalled } = stubWrite;
    const { calledOnce: infoCalled } = stubInfo;
    stubWrite.restore();
    stubInfo.restore();
    assert.isTrue(writeCalled, 'called');
    assert.isTrue(infoCalled, 'called');
    assert.strictEqual(res, filePath, 'result');
  });
});

describe('include libraries', () => {
  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        reason: new Error('error'),
        status: 'rejected'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const j = stubWrite.callCount;
    await includeLibraries();
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
  });

  it('should not call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        status: 'resolved'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const j = stubWrite.callCount;
    await includeLibraries();
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        reason: new Error('error'),
        status: 'rejected'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const j = stubWrite.callCount;
    const opt = {
      dir: 'tldts'
    };
    await includeLibraries(opt);
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
  });

  it('should not call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        status: 'resolved'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const j = stubWrite.callCount;
    const opt = {
      dir: 'tldts'
    };
    await includeLibraries(opt);
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
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
