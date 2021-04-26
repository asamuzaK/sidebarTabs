/**
 * setup.js
 */

'use strict';
const { JSDOM } = require('jsdom');
const { Schema } = require('webext-schema');
const process = require('process');
const sinon = require('sinon');

/**
 * create jsdom
 *
 * @returns {object} - jsdom instance
 */
const createJsdom = () => {
  const domstr = '<!DOCTYPE html><html><head></head><body></body></html>';
  const opt = {
    runScripts: 'dangerously',
    beforeParse(window) {
      window.alert = sinon.stub().callsFake((...args) => args.toString());
      window.matchMedia = sinon.stub().returns({
        matches: false
      });
    }
  };
  return new JSDOM(domstr, opt);
};

const { window } = createJsdom();
const { document } = window;

/**
 * get channel
 *
 * @returns {string} - channel
 */
const getChannel = () => {
  let ch;
  const reg = /(?<=--channel=)[a-z]+/;
  const args = process.argv.filter(arg => reg.test(arg));
  if (args.length) {
    [ch] = reg.exec(args);
  } else {
    ch = 'beta';
  }
  return ch;
};

const channel = getChannel();

console.log(`Channel: ${channel}`);

const browser = new Schema(channel).mock();

const mockPort = ({ name, sender }) => {
  const port = Object.assign({}, browser.runtime.Port);
  port.name = name;
  port.sender = sender;
  return port;
};

browser.i18n.getMessage.callsFake((...args) => args.toString());
browser.permissions.contains.resolves(true);

global.window = window;
global.document = document;
global.browser = browser;

module.exports = {
  browser, createJsdom, mockPort
};
