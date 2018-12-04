/**
 * setup.js
 */

"use strict";
const {JSDOM} = require("jsdom");
const browser = require("sinon-chrome/webextensions");
const sinon = require("sinon");

/**
 * create jsdom
 * @returns {Object} - jsdom instance
 */
const createJsdom = () => {
  const domstr = "<!DOCTYPE html><html><head></head><body></body></html>";
  const opt = {
    runScripts: "dangerously",
  };
  return new JSDOM(domstr, opt);
};

const {window} = createJsdom();
const {document} = window;

/* mock runtime.Port */
class Port {
  /**
   * Create stubbed object
   * @param {Object} opt - options
   */
  constructor(opt = {}) {
    this.name = opt.name;
    this.error = {
      message: sinon.stub(),
    };
    this.onDisconnect = {
      addListener: sinon.stub(),
      removeListener: sinon.stub(),
    };
    this.onMessage = {
      addListener: sinon.stub(),
      removeListener: sinon.stub(),
    };
    this.disconnect = sinon.stub();
    this.postMessage = sinon.stub();
  }
}

browser.runtime.Port = Port;
browser.i18n.getMessage.callsFake((...args) => args.toString());

global.browser = browser;
global.window = window;
global.document = document;

module.exports = {
  browser,
};
