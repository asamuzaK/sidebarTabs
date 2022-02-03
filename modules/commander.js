/**
 * commander.js
 */

/* api */
import { getType, isString } from './common.js';
import { createFile, fetchText, isFile, readFile } from './file-util.js';
import { promisify } from 'util';
import commander from 'commander';
import copyfiles from 'copyfiles';
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
 * copy library files and save package info
 *
 * @param {Array} lib - library
 * @param {boolean} info - console info
 * @returns {string} - package.json file path
 */
export const copyLibraryFiles = async (lib, info) => {
  if (!Array.isArray(lib)) {
    throw new TypeError(`Expected Array but got ${getType(lib)}.`);
  }
  const [key, value] = lib;
  const {
    name: moduleName,
    origin: originUrl,
    type,
    files
  } = value;
  const libPath = path.resolve(DIR_CWD, PATH_LIB, key);
  const modulePath = path.resolve(DIR_CWD, PATH_MODULE, moduleName);
  const pkgJsonPath = path.resolve(modulePath, 'package.json');
  const pkgJson = await readFile(pkgJsonPath, { encoding: CHAR, flag: 'r' });
  const {
    author, description, homepage, license, name, version
  } = JSON.parse(pkgJson);
  const copyLibFiles = promisify(copyfiles);
  const libFiles = [];
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
    libFiles.push(itemFile);
    origins.push({
      file,
      url: `${originUrl}@${version}/${itemPath}`
    });
  }
  libFiles.push(libPath);
  await copyLibFiles(libFiles, {
    error: true,
    up: true,
    verbose: !!info
  });
  const content = JSON.stringify({
    name,
    description,
    author,
    license,
    homepage,
    type,
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
  };
  const func = [];
  if (dir) {
    func.push(copyLibraryFiles([dir, libraries[dir]], info));
  } else {
    const items = Object.entries(libraries);
    for (const [key, value] of items) {
      func.push(copyLibraryFiles([key, value], info));
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