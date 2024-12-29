/* api */
import { strict as assert } from 'node:assert';
import fs, { promises as fsPromise } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import { MockAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici';

/* test */
import {
  commander, cleanDirectory, extractLibraries, extractManifests,
  includeLibraries, parseCommand, saveLibraryPackage, saveThemeManifest,
  updateManifests
} from '../scripts/commander.js';

const BASE_URL_MOZ = 'https://hg.mozilla.org';
const DIR_CWD = process.cwd();
const DIR_MOZ = '/mozilla-central/raw-file/tip/browser/themes/addons/';
const PATH_LIB = './src/lib';
const PATH_MODULE = './node_modules';

describe('save theme manifest file', () => {
  const globalDispatcher = getGlobalDispatcher();
  const mockAgent = new MockAgent();
  beforeEach(() => {
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();
  });
  afterEach(() => {
    mockAgent.enableNetConnect();
    setGlobalDispatcher(globalDispatcher);
  });

  it('should throw', async () => {
    await saveThemeManifest().catch(e => {
      assert.strictEqual(e instanceof TypeError, true, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should throw if file not found', async () => {
    const url = new URL(`${BASE_URL_MOZ}${DIR_MOZ}foo/manifest.json`);
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(404);
    await saveThemeManifest('foo').catch(e => {
      assert.strictEqual(e instanceof Error, true, 'error');
      assert.strictEqual(e.message,
        `Network response was not ok. status: 404 url: ${url}`);
    });
  });

  it('should get result', async () => {
    const dir = 'alpenglow';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    const url = new URL(`${BASE_URL_MOZ}${DIR_MOZ}${dir}/manifest.json`);
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(200, '{}');
    const res = await saveThemeManifest(dir);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should get result', async () => {
    const dir = 'alpenglow';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    const url = new URL(`${BASE_URL_MOZ}${DIR_MOZ}${dir}/manifest.json`);
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(200, '{}');
    const res = await saveThemeManifest(dir, true);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j + 1, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should get result', async () => {
    const dir = 'dark';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    const url = new URL(`${BASE_URL_MOZ}${DIR_MOZ}${dir}/manifest.json`);
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(200, '{}');
    const res = await saveThemeManifest(dir);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should get result', async () => {
    const dir = 'dark';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    const url = new URL(`${BASE_URL_MOZ}${DIR_MOZ}${dir}/manifest.json`);
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(200, '{}');
    const res = await saveThemeManifest(dir, true);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j + 1, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should get result', async () => {
    const dir = 'light';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    const url = new URL(`${BASE_URL_MOZ}${DIR_MOZ}${dir}/manifest.json`);
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(200, '{}');
    const res = await saveThemeManifest(dir);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should get result', async () => {
    const dir = 'light';
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'resource', `${dir}-manifest.json`);
    const url = new URL(`${BASE_URL_MOZ}${DIR_MOZ}${dir}/manifest.json`);
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(200, '{}');
    const res = await saveThemeManifest(dir, true);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j + 1, 'info');
    assert.strictEqual(res, filePath, 'result');
  });
});

describe('extract manifests', () => {
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
    await extractManifests();
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
    await extractManifests();
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
    await extractManifests(opt);
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
    await extractManifests(opt);
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
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
    const res = await updateManifests();
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
    assert.strictEqual(res, undefined, 'result');
  });
});

describe('save library package info', () => {
  it('should throw', async () => {
    await saveLibraryPackage().catch(e => {
      assert.strictEqual(e instanceof TypeError, true);
      assert.strictEqual(e.message, 'Expected Array but got Undefined.');
    });
  });

  it('should throw', async () => {
    await saveLibraryPackage([]).catch(e => {
      assert.strictEqual(e instanceof Error, true);
    });
  });

  it('should throw', async () => {
    await saveLibraryPackage([
      'foo'
    ]).catch(e => {
      assert.strictEqual(e instanceof Error, true);
    });
  });

  it('should throw', async () => {
    await saveLibraryPackage([
      'foo',
      {
        name: 'foo'
      }
    ]).catch(e => {
      assert.strictEqual(e instanceof Error, true);
    });
  });

  it('should throw', async () => {
    await saveLibraryPackage([
      'tldts',
      {
        name: 'tldts-experimental',
        cdn: 'https://unpkg.com/tldts-experimental',
        type: 'module',
        files: [
          {
            file: 'foo',
            path: 'foo.txt'
          }
        ]
      }
    ]).catch(e => {
      const filePath =
        path.resolve(DIR_CWD, PATH_MODULE, 'tldts-experimental', 'foo.txt');
      assert.strictEqual(e instanceof Error, true);
      assert.strictEqual(e.message, `${filePath} is not a file.`);
    });
  });

  it('should throw', async () => {
    await saveLibraryPackage([
      'tldts',
      {
        name: 'tldts-experimental',
        cdn: 'https://unpkg.com/tldts-experimental',
        repository: {
          type: 'git',
          url: 'git+ssh://git@github.com/remusao/tldts.git'
        },
        type: 'module',
        files: [
          {
            file: 'foo',
            path: 'LICENSE'
          }
        ]
      }
    ]).catch(e => {
      const filePath = path.resolve(DIR_CWD, PATH_LIB, 'tldts', 'foo');
      assert.strictEqual(e instanceof Error, true);
      assert.strictEqual(e.message, `${filePath} is not a file.`);
    });
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const filePath = path.resolve(DIR_CWD, PATH_LIB, 'tldts', 'package.json');
    const res = await saveLibraryPackage([
      'tldts',
      {
        name: 'tldts-experimental',
        cdn: 'https://unpkg.com/tldts-experimental',
        repository: {
          type: 'git',
          url: 'git+ssh://git@github.com/remusao/tldts.git'
        },
        type: 'module',
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
    const { called: infoCalled } = stubInfo;
    const { calledOnce: writeCalled } = stubWrite;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCalled, true, 'called');
    assert.strictEqual(infoCalled, false, 'not called');
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
        cdn: 'https://unpkg.com/tldts-experimental',
        repository: {
          type: 'git',
          url: 'git+ssh://git@github.com/remusao/tldts.git'
        },
        type: 'module',
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
    assert.strictEqual(writeCalled, true, 'called');
    assert.strictEqual(infoCalled, true, 'called');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const filePath = path.resolve(DIR_CWD, PATH_LIB, 'purify', 'package.json');
    const res = await saveLibraryPackage([
      'purify',
      {
        name: 'dompurify',
        raw: 'https://raw.githubusercontent.com/cure53/DOMPurify/',
        cdn: 'https://unpkg.com/dompurify',
        repository: {
          type: 'git',
          url: 'git://github.com/cure53/DOMPurify.git'
        },
        files: [
          {
            file: 'LICENSE',
            path: 'LICENSE'
          },
          {
            file: 'purify.min.js',
            path: 'dist/purify.min.js'
          },
          {
            file: 'purify.min.js.map',
            path: 'dist/purify.min.js.map'
          }
        ]
      }
    ]);
    const { called: infoCalled } = stubInfo;
    const { calledOnce: writeCalled } = stubWrite;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCalled, true, 'called');
    assert.strictEqual(infoCalled, false, 'not called');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const filePath = path.resolve(DIR_CWD, PATH_LIB, 'purify', 'package.json');
    const res = await saveLibraryPackage([
      'purify',
      {
        name: 'dompurify',
        raw: 'https://raw.githubusercontent.com/cure53/DOMPurify/',
        cdn: 'https://unpkg.com/dompurify',
        repository: {
          type: 'git',
          url: 'git://github.com/cure53/DOMPurify.git'
        },
        files: [
          {
            file: 'LICENSE',
            path: 'LICENSE'
          },
          {
            file: 'purify.min.js',
            path: 'dist/purify.min.js'
          },
          {
            file: 'purify.min.js.map',
            path: 'dist/purify.min.js.map'
          }
        ]
      }
    ], true);
    const { calledOnce: writeCalled } = stubWrite;
    const { calledOnce: infoCalled } = stubInfo;
    stubWrite.restore();
    stubInfo.restore();
    assert.strictEqual(writeCalled, true, 'called');
    assert.strictEqual(infoCalled, true, 'called');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const filePath = path.resolve(DIR_CWD, PATH_LIB, 'url', 'package.json');
    const res = await saveLibraryPackage([
      'url',
      {
        name: 'url-sanitizer',
        raw: 'https://raw.githubusercontent.com/asamuzaK/urlSanitizer/',
        vPrefix: 'v',
        cdn: 'https://unpkg.com/url-sanitizer',
        repository: {
          type: 'git',
          url: 'https://github.com/asamuzaK/urlSanitizer.git'
        },
        type: 'module',
        files: [
          {
            file: 'LICENSE',
            path: 'LICENSE'
          },
          {
            file: 'url-sanitizer-wo-dompurify.min.js',
            path: 'dist/url-sanitizer-wo-dompurify.min.js'
          },
          {
            file: 'url-sanitizer-wo-dompurify.min.js.map',
            path: 'dist/url-sanitizer-wo-dompurify.min.js.map'
          }
        ]
      }
    ]);
    const { called: infoCalled } = stubInfo;
    const { calledOnce: writeCalled } = stubWrite;
    stubInfo.restore();
    stubWrite.restore();
    assert.strictEqual(writeCalled, true, 'called');
    assert.strictEqual(infoCalled, false, 'not called');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const filePath = path.resolve(DIR_CWD, PATH_LIB, 'url', 'package.json');
    const res = await saveLibraryPackage([
      'url',
      {
        name: 'url-sanitizer',
        raw: 'https://raw.githubusercontent.com/asamuzaK/urlSanitizer/',
        vPrefix: 'v',
        cdn: 'https://unpkg.com/url-sanitizer',
        repository: {
          type: 'git',
          url: 'https://github.com/asamuzaK/urlSanitizer.git'
        },
        type: 'module',
        files: [
          {
            file: 'LICENSE',
            path: 'LICENSE'
          },
          {
            file: 'url-sanitizer-wo-dompurify.min.js',
            path: 'dist/url-sanitizer-wo-dompurify.min.js'
          },
          {
            file: 'url-sanitizer-wo-dompurify.min.js.map',
            path: 'dist/url-sanitizer-wo-dompurify.min.js.map'
          }
        ]
      }
    ], true);
    const { calledOnce: writeCalled } = stubWrite;
    const { calledOnce: infoCalled } = stubInfo;
    stubWrite.restore();
    stubInfo.restore();
    assert.strictEqual(writeCalled, true, 'called');
    assert.strictEqual(infoCalled, true, 'called');
    assert.strictEqual(res, filePath, 'result');
  });
});

describe('extract libraries', () => {
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
    await extractLibraries();
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
    await extractLibraries();
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
    await extractLibraries(opt);
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
    await extractLibraries(opt);
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
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
    const res = await includeLibraries();
    const { callCount: traceCallCount } = stubTrace;
    const { callCount: writeCallCount } = stubWrite;
    stubAll.restore();
    stubTrace.restore();
    stubWrite.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace');
    assert.strictEqual(writeCallCount, j, 'write');
    assert.strictEqual(res, undefined, 'result');
  });
});

describe('clean directory', () => {
  it('should not call funtion', () => {
    const stubRm = sinon.stub(fs, 'rmSync');
    const dir = path.resolve('foo');
    cleanDirectory({ dir });
    const { called: rmCalled } = stubRm;
    stubRm.restore();
    assert.strictEqual(rmCalled, false, 'not called');
  });

  it('should call funtion', () => {
    const stubRm = sinon.stub(fs, 'rmSync');
    const stubInfo = sinon.stub(console, 'info');
    const dir = path.resolve('test', 'file');
    cleanDirectory({ dir });
    const { calledOnce: rmCalled } = stubRm;
    const { called: infoCalled } = stubInfo;
    stubRm.restore();
    stubInfo.restore();
    assert.strictEqual(rmCalled, true, 'called');
    assert.strictEqual(infoCalled, false, 'not called');
  });

  it('should call funtion', () => {
    const stubRm = sinon.stub(fs, 'rmSync');
    const stubInfo = sinon.stub(console, 'info');
    const dir = path.resolve('test', 'file');
    cleanDirectory({ dir, info: true });
    const { calledOnce: rmCalled } = stubRm;
    const { calledOnce: infoCalled } = stubInfo;
    stubRm.restore();
    stubInfo.restore();
    assert.strictEqual(rmCalled, true, 'called');
    assert.strictEqual(infoCalled, true, 'not called');
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

  it('should parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const stubVer = sinon.stub(commander, 'version');
    const spyCmd = sinon.spy(commander, 'command');
    const i = stubParse.callCount;
    const j = stubVer.callCount;
    const k = spyCmd.callCount;
    parseCommand(['foo', 'bar', 'clean']);
    assert.strictEqual(stubParse.callCount, i + 1, 'called');
    assert.strictEqual(stubVer.callCount, j + 1, 'called');
    assert.strictEqual(spyCmd.callCount, k + 1, 'called');
    stubParse.restore();
    stubVer.restore();
    spyCmd.restore();
  });

  it('should parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const stubVer = sinon.stub(commander, 'version');
    const spyCmd = sinon.spy(commander, 'command');
    const i = stubParse.callCount;
    const j = stubVer.callCount;
    const k = spyCmd.callCount;
    parseCommand(['foo', 'bar', 'include']);
    assert.strictEqual(stubParse.callCount, i + 1, 'called');
    assert.strictEqual(stubVer.callCount, j + 1, 'called');
    assert.strictEqual(spyCmd.callCount, k + 1, 'called');
    stubParse.restore();
    stubVer.restore();
    spyCmd.restore();
  });

  it('should parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const stubVer = sinon.stub(commander, 'version');
    const spyCmd = sinon.spy(commander, 'command');
    const i = stubParse.callCount;
    const j = stubVer.callCount;
    const k = spyCmd.callCount;
    parseCommand(['foo', 'bar', 'update']);
    assert.strictEqual(stubParse.callCount, i + 1, 'called');
    assert.strictEqual(stubVer.callCount, j + 1, 'called');
    assert.strictEqual(spyCmd.callCount, k + 1, 'called');
    stubParse.restore();
    stubVer.restore();
    spyCmd.restore();
  });
});
