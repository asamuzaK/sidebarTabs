/**
 * commander.js
 */

/* api */
import { getType, isString } from '../src/mjs/common.js';
import fs, { promises as fsPromise } from 'fs';
import commander from 'commander';
import fetch from 'node-fetch';
import path from 'path';
import process from 'process';

/* constants */
const BASE_URL =
  'https://hg.mozilla.org/mozilla-central/raw-file/tip/browser/themes/addons/';
const CHAR = 'utf8';
const DIR_CWD = process.cwd();
const INDENT = 2;
const PATH_LIB = './src/lib';
const PATH_MODULE = './node_modules';
const PERM_FILE = 0o644;

/**
 * get stat
 *
 * @param {string} file - file path
 * @returns {object} - file stat
 */
export const getStat = file =>
  isString(file) && fs.existsSync(file) ? fs.statSync(file) : null;

/**
 * the file is a file
 *
 * @param {string} file - file path
 * @returns {boolean} - result
 */
export const isFile = file => {
  const stat = getStat(file);
  return stat ? stat.isFile() : false;
};

/**
 * read a file
 *
 * @param {string} file - file path
 * @param {object} [opt] - options
 * @param {string} [opt.encoding] - encoding
 * @param {string} [opt.flag] - flag
 * @returns {string|Buffer} - file content
 */
export const readFile = async (file, opt = { encoding: null, flag: 'r' }) => {
  if (!isFile(file)) {
    throw new Error(`${file} is not a file.`);
  }
  const value = await fsPromise.readFile(file, opt);
  return value;
};

/**
 * create a file
 *
 * @param {string} file - file path to create
 * @param {string} value - value to write
 * @returns {string} - file path
 */
export const createFile = async (file, value) => {
  if (!isString(file)) {
    throw new TypeError(`Expected String but got ${getType(file)}.`);
  }
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const filePath = path.resolve(file);
  await fsPromise.writeFile(filePath, value, {
    encoding: CHAR, flag: 'w', mode: PERM_FILE
  });
  return filePath;
};

/**
 * fetch text
 *
 * @param {string} url - URL
 * @returns {string} - content text
 */
export const fetchText = async url => {
  if (!isString(url)) {
    throw new TypeError(`Expected String but got ${getType(url)}.`);
  }
  const res = await fetch(url);
  const { ok, status } = res;
  if (!ok) {
    const msg = `Network response was not ok. status: ${status} url: ${url}`;
    throw new Error(msg);
  }
  return res.text();
};

/**
 * save theme manifest file
 *
 * @param {string} dir - theme directory
 * @param {boolean} info - console info
 * @returns {string} - file path
 */
export const saveThemeManifest = async (dir, info) => {
  if (!isString(dir)) {
    throw new TypeError(`Expected String but got ${getType(dir)}.`);
  }
  const manifestUrl = `${BASE_URL}${dir}/manifest.json`;
  const manifest = await fetchText(manifestUrl);
  const filePath = path.resolve(DIR_CWD, 'resource', `${dir}-manifest.json`);
  const file = await createFile(filePath, manifest);
  if (file && info) {
    console.info(`Created: ${file}`);
  }
  return file;
};

/**
 * update theme manifests
 *
 * @param {object} cmdOpts - command options
 * @returns {void}
 */
export const updateManifests = async (cmdOpts = {}) => {
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
 * save library package file
 *
 * @param {Array} lib - library
 * @param {boolean} info - console info
 * @returns {string} - file path
 */
export const saveLibraryPackage = async (lib, info) => {
  if (!Array.isArray(lib)) {
    throw new TypeError(`Expected Array but got ${getType(lib)}.`);
  }
  const [key, value] = lib;
  const {
    name: moduleName,
    origin: originUrl,
    files
  } = value;
  const libPath = path.resolve(DIR_CWD, PATH_LIB, key);
  const pkgJsonPath =
    path.resolve(DIR_CWD, PATH_MODULE, moduleName, 'package.json');
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
    const itemFile = path.resolve(libPath, file);
    if (!isFile(itemFile)) {
      throw new Error(`${itemFile} is not a file.`);
    }
    origins.push({
      file,
      url: `${originUrl}@${version}/${itemPath}`
    });
  }
  const content = JSON.stringify({
    name,
    description,
    author,
    license,
    homepage,
    type: 'module',
    version,
    origins
  }, null, INDENT);
  const filePath = path.resolve(libPath, 'package.json');
  const libPkg = await createFile(filePath, content + '\n');
  if (libPkg && info) {
    console.info(`Created: ${libPkg}`);
  }
  return libPkg;
};

/**
 * include libraries
 *
 * @param {object} cmdOpts - command options
 * @returns {void}
 */
export const includeLibraries = async (cmdOpts = {}) => {
  const { dir, info } = cmdOpts;
  const libraries = {
    tldts: {
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
 * parse command
 *
 * @param {Array} args - process.argv
 * @returns {void}
 */
export const parseCommand = args => {
  const reg = /^(?:(?:--)?help|-[h|v]|--version|i(?:nclude)|u(?:pdate)?)$/;
  if (Array.isArray(args) && args.some(arg => reg.test(arg))) {
    commander.exitOverride();
    commander.version(process.env.npm_package_version, '-v, --version');
    commander.command('update').alias('u').description('update theme manifests')
      .option('-d, --dir <name>', 'specify theme directory')
      .option('-i, --info', 'console info')
      .action(updateManifests);
    commander.command('include').alias('i')
      .description('include library package.json')
      .option('-d, --dir <name>', 'specify library directory')
      .option('-i, --info', 'console info')
      .action(includeLibraries);
    commander.parse(args);
  }
};

/* For test */
export {
  commander
};
