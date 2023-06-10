/**
 * setup.js
 */

import process from 'node:process';
import {
  closest, matches, querySelector, querySelectorAll
} from '@asamuzakjp/dom-selector';
import domPurify from 'dompurify';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { Schema } from 'webext-schema';

/**
 * create jsdom
 * @returns {object} - jsdom instance
 */
export const createJsdom = () => {
  const domstr = '<!DOCTYPE html><html><head></head><body></body></html>';
  const opt = {
    runScripts: 'dangerously',
    beforeParse(window) {
      window.alert = sinon.stub();
      window.matchMedia = sinon.stub().returns({
        matches: false
      });
      window.prompt = sinon.stub();
      window.DOMPurify = domPurify;
    }
  };
  return new JSDOM(domstr, opt);
};

const { window } = createJsdom();
const { document } = window;

/**
 * patch jsdom
 * @param {object} win - window
 * @returns {object} - window
 */
export const patchJsdom = win => {
  win.Element.prototype.matches = function (selector) {
    return matches(selector, this);
  };
  win.Element.prototype.closest = function (selector) {
    return closest(selector, this);
  };
  win.Document.prototype.querySelector = function (selector) {
    return querySelector(selector, this);
  };
  win.DocumentFragment.prototype.querySelector = function (selector) {
    return querySelector(selector, this);
  };
  win.Element.prototype.querySelector = function (selector) {
    return querySelector(selector, this);
  };
  win.Document.prototype.querySelectorAll = function (selector) {
    return querySelectorAll(selector, this);
  };
  win.DocumentFragment.prototype.querySelectorAll = function (selector) {
    return querySelectorAll(selector, this);
  };
  win.Element.prototype.querySelectorAll = function (selector) {
    return querySelectorAll(selector, this);
  };
  return win;
};

/**
 * get channel
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

export const browser = new Schema(channel).mock();

export const mockPort = ({ name, sender }) => {
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
