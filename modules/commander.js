/**
 * commander.js
 */

/* api */
import path from 'node:path';
import process from 'node:process';
import { program as commander } from 'commander';
import { getType, isString, throwErr } from './common.js';
import {
  createFile, fetchText, isDir, isFile, readFile, removeDir
} from './file-util.js';

/* constants */
const BASE_URL_MOZ =
  'https://hg.mozilla.org/mozilla-central/raw-file/tip/browser/themes/addons/';
const CHAR = 'utf8';
const DIR_CWD = process.cwd();
const INDENT = 2;
const PATH_LIB = './src/lib';
const PATH_MODULE = './node_modules';

/**
 * save theme manifest file
 * @param {string} dir - theme directory
 * @param {boolean} info - console info
 * @returns {Promise.<string>} - file path
 */
export const saveThemeManifest = async (dir, info) => {
  if (!isString(dir)) {
    throw new TypeError(`Expected String but got ${getType(dir)}.`);
  }
  const manifestUrl = `${BASE_URL_MOZ}${dir}/manifest.json`;
  const manifest = await fetchText(manifestUrl);
  const filePath = await createFile(
    path.resolve(DIR_CWD, 'resource', `${dir}-manifest.json`),
    manifest
  );
  if (filePath && info) {
    console.info(`Created: ${filePath}`);
  }
  return filePath;
};

/**
 * extract manifests
 * @param {object} cmdOpts - command options
 * @returns {Promise.<void>} - void
 */
export const extractManifests = async (cmdOpts = {}) => {
  const { dir, info } = cmdOpts;
  const func = [];
  if (dir) {
    func.push(saveThemeManifest(dir, info));
  } else {
    func.push(
      saveThemeManifest('alpenglow', info),
      saveThemeManifest('dark', info),
      saveThemeManifest('light', info)
    );
  }
  const arr = await Promise.allSettled(func);
  for (const i of arr) {
    const { reason, status } = i;
    if (status === 'rejected' && reason) {
      console.trace(reason);
    }
  }
};

/**
 * update manifests
 * @param {object} cmdOpts - command options
 * @returns {Promise} - promise chain
 */
export const updateManifests = cmdOpts =>
  extractManifests(cmdOpts).catch(throwErr);

/**
 * save library package info
 * @param {Array} lib - library
 * @param {boolean} info - console info
 * @returns {Promise.<string>} - package.json file path
 */
export const saveLibraryPackage = async (lib, info) => {
  if (!Array.isArray(lib)) {
    throw new TypeError(`Expected Array but got ${getType(lib)}.`);
  }
  const [key, value] = lib;
  const {
    files,
    repository,
    type,
    vPrefix,
    cdn: cdnUrl,
    name: moduleName,
    raw: rawUrl
  } = value;
  const libPath = path.resolve(DIR_CWD, PATH_LIB, key);
  const modulePath = path.resolve(DIR_CWD, PATH_MODULE, moduleName);
  const pkgJsonPath = path.resolve(modulePath, 'package.json');
  const pkgJson = await readFile(pkgJsonPath, { encoding: CHAR, flag: 'r' });
  const {
    author, description, homepage, license, name, version
  } = JSON.parse(pkgJson);
  const origins = [];
  for (const item of files) {
    const {
      file,
      path: itemPath
    } = item;
    const itemFile = path.resolve(modulePath, itemPath);
    if (!isFile(itemFile)) {
      throw new Error(`${itemFile} is not a file.`);
    }
    const libFile = path.resolve(libPath, file);
    if (!isFile(libFile)) {
      throw new Error(`${libFile} is not a file.`);
    }
    const fileMap = new Map();
    fileMap.set('file', file);
    if (rawUrl) {
      fileMap.set('raw', `${rawUrl}${vPrefix || ''}${version}/${itemPath}`);
    }
    fileMap.set('cdn', `${cdnUrl}@${version}/${itemPath}`);
    origins.push(Object.fromEntries(fileMap));
  }
  const content = JSON.stringify({
    name,
    description,
    author,
    license,
    homepage,
    repository,
    type,
    version,
    origins
  }, null, INDENT);
  const filePath =
    await createFile(path.resolve(libPath, 'package.json'), `${content}\n`);
  if (filePath && info) {
    console.info(`Created: ${filePath}`);
  }
  return filePath;
};

/**
 * extract libraries
 * @param {object} cmdOpts - command options
 * @returns {Promise.<void>} - void
 */
export const extractLibraries = async (cmdOpts = {}) => {
  const { dir, info } = cmdOpts;
  const libraries = {
    color: {
      name: '@asamuzakjp/css-color',
      raw: 'https://raw.githubusercontent.com/asamuzaK/cssColor/',
      vPrefix: 'v',
      cdn: 'https://unpkg.com/@asamuzakjp/css-color',
      repository: {
        type: 'git',
        url: 'https://github.com/asamuzaK/cssColor.git'
      },
      type: 'module',
      files: [
        {
          file: 'LICENSE',
          path: 'LICENSE'
        },
        {
          file: 'css-color.min.js',
          path: 'dist/esm/css-color.min.js'
        },
        {
          file: 'css-color.min.js.map',
          path: 'dist/esm/css-color.min.js.map'
        }
      ]
    },
    purify: {
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
    },
    tldts: {
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
    },
    url: {
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
  };
  const func = [];
  if (dir) {
    func.push(saveLibraryPackage([dir, libraries[dir]], info));
  } else {
    const items = Object.entries(libraries);
    for (const [key, value] of items) {
      func.push(saveLibraryPackage([key, value], info));
    }
  }
  const arr = await Promise.allSettled(func);
  for (const i of arr) {
    const { reason, status } = i;
    if (status === 'rejected' && reason) {
      console.trace(reason);
    }
  }
};

/**
 * include libraries
 * @param {object} cmdOpts - command options
 * @returns {Promise} - promise chain
 */
export const includeLibraries = cmdOpts =>
  extractLibraries(cmdOpts).catch(throwErr);

/**
 * clean directory
 * @param {object} cmdOpts - command options
 * @returns {void}
 */
export const cleanDirectory = (cmdOpts = {}) => {
  const { dir, info } = cmdOpts;
  if (isDir(dir)) {
    removeDir(dir);
    if (info) {
      console.info(`Removed: ${path.resolve(dir)}`);
    }
  }
};

/**
 * parse command
 * @param {Array} args - process.argv
 * @returns {void}
 */
export const parseCommand = args => {
  const reg = /^(?:(?:--)?help|-[h|v]|--version|(?:includ|updat)e|clean)$/;
  if (Array.isArray(args) && args.some(arg => reg.test(arg))) {
    commander.exitOverride();
    commander.version(process.env.npm_package_version, '-v, --version');
    commander.command('clean')
      .description('clean directory')
      .option('-d, --dir <name>', 'specify directory')
      .option('-i, --info', 'console info')
      .action(cleanDirectory);
    commander.command('include')
      .description('include library packages')
      .option('-d, --dir <name>', 'specify library directory')
      .option('-i, --info', 'console info')
      .action(includeLibraries);
    commander.command('update')
      .description('update theme manifests')
      .option('-d, --dir <name>', 'specify theme directory')
      .option('-i, --info', 'console info')
      .action(updateManifests);
    commander.parse(args);
  }
};

/* For test */
export {
  commander
};
