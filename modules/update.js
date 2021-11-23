/**
 * update.js
 */

/* api */
import { getType, isString } from '../src/mjs/common.js';
import { promises as fsPromise } from 'fs';
import commander from 'commander';
import fetch from 'node-fetch';
import path from 'path';
import process from 'process';

/* constants */
export const BASE_URL =
  'https://hg.mozilla.org/mozilla-central/raw-file/tip/browser/themes/addons/';
const CHAR = 'utf8';
const DIR_CWD = process.cwd();
const PERM_FILE = 0o644;

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
  const filePath =
    path.resolve(DIR_CWD, 'resource', `${dir}-manifest.json`);
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
 * parse command
 *
 * @param {Array} args - process.argv
 * @returns {void}
 */
export const parseCommand = args => {
  const reg = /^(?:(?:--)?help|-[h|v]|--version|u(?:pdate)?)$/;
  if (Array.isArray(args) && args.some(arg => reg.test(arg))) {
    commander.exitOverride();
    commander.version(process.env.npm_package_version, '-v, --version');
    commander.command('update').alias('u').description('update theme manifests')
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
