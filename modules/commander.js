/**
 * commander.js
 */

/* api */
import { getType, isString, throwErr } from './common.js';
import {
  createFile, fetchText, isFile, readFile, removeFile
} from './file-util.js';
import { program as commander } from 'commander';
import csvToJson from 'convert-csv-to-json';
import path from 'node:path';
import process from 'node:process';

/* constants */
const BASE_URL_IANA = 'https://www.iana.org/assignments/uri-schemes/';
const BASE_URL_MOZ =
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
 *
 * @param {object} cmdOpts - command options
 * @returns {void}
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
 *
 * @param {object} cmdOpts - command options
 * @returns {Function} - promise chain
 */
export const updateManifests = cmdOpts =>
  extractManifests(cmdOpts).catch(throwErr);

/**
 * save URI schemes file
 *
 * @see {@link https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml}
 *      - Historical schemes omitted
 *      - Added 'moz-extension' scheme
 * @param {string} dir - directory name
 * @param {boolean} info - console info
 * @returns {string} - file path
 */
export const saveUriSchemes = async (dir, info) => {
  if (!isString(dir)) {
    throw new TypeError(`Expected String but got ${getType(dir)}.`);
  }
  const libPath = path.resolve(DIR_CWD, PATH_LIB, dir);
  const csvFile = 'uri-schemes-1.csv';
  const csvText = await fetchText(`${BASE_URL_IANA}${csvFile}`);
  const csvContent =
    csvText.replace(/("[^,]+),([^,]+")/g, (m, p1, p2) => `${p1}_${p2}`);
  const csvPath =
    await createFile(path.resolve(libPath, csvFile), `${csvContent}\n`);
  const items = await csvToJson.fieldDelimiter(',').getJsonFromCsv(csvPath);
  const schemes = new Set(['moz-extension']);
  for (const item of items) {
    const { URIScheme: scheme, Status: status } = item;
    if (!/obsolete|\+/i.test(scheme) &&
        /^p(?:ermanent|rovisional)$/i.test(status)) {
      schemes.add(scheme);
    }
  }
  const content = JSON.stringify([...schemes].sort(), null, INDENT);
  const filePath =
    await createFile(path.resolve(libPath, 'uri-schemes.json'), `${content}\n`);
  if (filePath && info) {
    console.info(`Created: ${filePath}`);
  }
  await removeFile(csvPath, {
    force: true
  });
  return filePath;
};

/**
 * save library package info
 *
 * @param {Array} lib - library
 * @param {boolean} info - console info
 * @returns {string} - package.json file path
 */
export const saveLibraryPackage = async (lib, info) => {
  if (!Array.isArray(lib)) {
    throw new TypeError(`Expected Array but got ${getType(lib)}.`);
  }
  const [key, value] = lib;
  const {
    name: moduleName,
    origin: originUrl,
    repository,
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
 *
 * @param {object} cmdOpts - command options
 * @returns {void}
 */
export const extractLibraries = async (cmdOpts = {}) => {
  const { dir, info } = cmdOpts;
  const libraries = {
    tldts: {
      name: 'tldts-experimental',
      origin: 'https://unpkg.com/tldts-experimental',
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
  };
  const func = [];
  if (dir === 'iana') {
    func.push(saveUriSchemes(dir, info));
  } else if (dir) {
    func.push(saveLibraryPackage([dir, libraries[dir]], info));
  } else {
    const items = Object.entries(libraries);
    for (const [key, value] of items) {
      func.push(saveLibraryPackage([key, value], info));
    }
    func.push(saveUriSchemes(dir, info));
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
 *
 * @param {object} cmdOpts - command options
 * @returns {Function} - promise chain
 */
export const includeLibraries = cmdOpts =>
  extractLibraries(cmdOpts).catch(throwErr);

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
      .description('include library packages')
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
